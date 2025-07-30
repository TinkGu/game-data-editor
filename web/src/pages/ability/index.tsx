import { useEffect, useState } from 'react';
import { useDebounceFn } from '@tinks/xeno/react';
import { toast } from 'app/components';
import { IconAll, IconClear, IconDraft, IconInfo, IconSearch } from 'app/components/icons';
import classnames from 'classnames/bind';
import { useAtomView } from 'use-atom-view';
import { AbilityExampleList, AbilityItem, addAbilityItem } from './ability-item';
import { showSearch } from './ability-search';
import { showDrafts } from './drafts';
import { ExplorePannel } from './explore';
import { DbTagPicker, editFactor } from './factor-editor';
import { llmAbility } from './llm';
import { showSettings } from './settings';
import { db, Ability, store, calcStats, draftDb, toggleExample, hasInExamples } from './state';
import { showTagPreview } from './tag-preview';
import { TagsBullet } from './tags-bullet';
import styles from './styles.module.scss';

const cx = classnames.bind(styles);

/** 获取两个数组的交集 */
function getIntersection(a: any[], b: any[]) {
  if (!a.length || !b.length) {
    return [];
  }
  return a.filter((x) => b.indexOf(x) > -1);
}

/** a 完整包含 b */
function fullIncludes(a: any[], b: any[]) {
  if (!a.length || !b.length) {
    return false;
  }
  for (let x of b) {
    if (!a.includes(x)) {
      return false;
    }
  }
  return true;
}

export default function PageEditorAbilityList() {
  const { tags, showStats, filterType, isExamplePicking, examples } = useAtomView(store);
  const { items } = useAtomView(db.atom);
  const { items: draftItems } = useAtomView(draftDb.atom);
  const [records, setRecords] = useState<Ability[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [exploreMode, setExploreMode] = useState(false);
  const [isLlmLoading, setIsLlmLoading] = useState(false);

  useEffect(() => {
    const list = db.atom.get().items;
    let next = list;
    if (filterType === 'every') {
      next = list.filter((x) => !!x.tags?.length && fullIncludes(x.tags, tags));
    } else {
      next = list.filter((x) => !!x.tags?.length && getIntersection(x.tags, tags)?.length);
    }
    setRecords(next);
  }, [tags, items, filterType]);

  useEffect(() => {
    async function init() {
      await db.pull();
      calcStats();
      draftDb.pull();
    }
    init();
  }, []);

  const handleEnterEditMode = useDebounceFn(() => {
    setEditMode((x) => !x);
  });

  const handleClickTag = ({ id }: { id: number }) => {
    if (editMode) {
      editFactor({ id });
    } else {
      if (tags.includes(id)) {
        store.merge({ tags: tags.filter((x) => x !== id) });
      } else {
        store.merge({ tags: [...tags, id] });
      }
    }
  };

  const handleClearTags = () => {
    store.merge({ tags: [] });
  };

  const handleTogglePicking = useDebounceFn(() => {
    store.modify((x) => ({ ...x, isExamplePicking: !x.isExamplePicking }));
  });

  const handleClickLLM = useDebounceFn(async () => {
    if (isLlmLoading) return;
    if (tags.length === 0) {
      toast.info('请至少选择一个标签');
      return;
    }

    setIsLlmLoading(true);
    try {
      const res = await llmAbility({ tags });
      console.log('res', res);
      const drafts = res.items.map((x) => ({ ...x, uid: draftDb.uuid() }));
      draftDb.atom.modify((x) => ({ ...x, items: [...drafts, ...x.items] }));
      draftDb.save();
      showDrafts();
    } catch (err) {
      console.error(err);
      toast.error(err);
    }
    setIsLlmLoading(false);
  });

  if (exploreMode) {
    return <ExplorePannel onExit={() => setExploreMode(false)} />;
  }

  return (
    <div className={cx('page-editor')}>
      <div className={cx('mask', { active: isLlmLoading })}></div>
      <div className={cx('page-header')}>
        <div className={cx('page-actions')}>
          <div className={cx('btn')} onClick={() => addAbilityItem()}>
            写一条
          </div>
          <div className={cx('btn', { active: editMode })} onClick={handleEnterEditMode}>
            {editMode ? '退出修改' : '改标签'}
          </div>
          <div className={cx('btn', { active: isExamplePicking })} onClick={handleTogglePicking}>
            {isExamplePicking ? '退出采样' : '采样'}
          </div>
          <div className={cx('btn')} onClick={handleClickLLM}>
            {isLlmLoading ? '思考中...' : '🪄AI'}
          </div>
          <div className={cx('rights')}>
            <div className={cx('btn', 'icon')} onClick={showDrafts}>
              <IconDraft />
              {!!draftItems?.length && <div className={cx('draft-count')}>{draftItems.length}</div>}
            </div>
            <div className={cx('btn', 'icon')} onClick={showTagPreview}>
              <IconInfo />
            </div>
            <div className={cx('btn', 'icon')} onClick={showSearch}>
              <IconSearch />
            </div>
            <div className={cx('btn', 'icon')} onClick={showSettings}>
              <IconAll />
            </div>
          </div>
        </div>
        {(!!tags.length || !!examples.length) && (
          <div className={cx('results-box')}>
            <div>
              <TagsBullet className={cx('active-tags')} tags={tags} onClick={(x) => handleClickTag({ id: x })} />
              <AbilityExampleList abilities={examples} onClick={toggleExample} />
            </div>
            <div className={cx('clear-tags')} onClick={handleClearTags}>
              <IconClear />
            </div>
          </div>
        )}
      </div>
      <DbTagPicker className={cx('root-tags-picker')} tags={tags} onClick={handleClickTag} showBadge={showStats} />
      {!!records?.length && (
        <div className={cx('records')}>
          <div className={cx('total')}>
            共 <span className={cx('num')}>{records.length}</span> 条
          </div>
          {records.map((x) => (
            <AbilityItem ability={x} key={x.id} active={hasInExamples(x.id)} onClick={isExamplePicking ? toggleExample : undefined} />
          ))}
        </div>
      )}
      {!tags.length && !records?.length && !!items?.length && (
        <div className={cx('records')}>
          <div className={cx('total')}>
            共 <span className={cx('num')}>{items.length}</span> 条
          </div>
          {items.map((x) => (
            <AbilityItem ability={x} key={x.id} active={hasInExamples(x.id)} onClick={isExamplePicking ? toggleExample : undefined} />
          ))}
        </div>
      )}
    </div>
  );
}
