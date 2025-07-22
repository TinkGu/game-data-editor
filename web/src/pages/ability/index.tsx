import { useEffect, useState } from 'react';
import { getDataset } from '@tinks/xeno';
import { useDebounceFn } from '@tinks/xeno/react';
import { Modal, toast } from 'app/components';
import { IconSearch } from 'app/components/icons';
import classnames from 'classnames/bind';
import { useAtomView } from 'use-atom-view';
import { AbilityItem, addAbilityItem } from './ability-item';
import { showSearch } from './ability-search';
import { ExplorePannel } from './explore';
import { DbTagPicker, editFactor } from './factor-editor';
import { db, Ability, store, setStatsModeMemo, calcStats } from './state';
import { TagPreview } from './tag-preview';
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
  const { tags, showStats } = useAtomView(store);
  const { items } = useAtomView(db.atom);
  const [records, setRecords] = useState<Ability[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [exploreMode, setExploreMode] = useState(false);
  const [filterType, setFilterType] = useState<'some' | 'every'>('some');

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

  const handleChangeFilterType = useDebounceFn(() => {
    let close = () => {};
    const handleSelect = async (e: any) => {
      const { type } = getDataset(e);
      setFilterType(type);
      close();
    };

    close = Modal.show({
      type: 'half-screen',
      maskClosable: true,
      content: () => (
        <div className={cx('modal')}>
          <div className={cx('selects')}>
            <div className={cx('select-option')} onClick={handleSelect} data-type="some">
              含有
              <span className={cx('tip')}>条目只要含有任意一条选中的标签就可以</span>
            </div>
            <div className={cx('select-option')} onClick={handleSelect} data-type="every">
              重叠
              <span className={cx('tip')}>条目必须完全含有选中的标签</span>
            </div>
          </div>
        </div>
      ),
    });
  });

  const handleChangeStatsMode = useDebounceFn(() => {
    setStatsModeMemo(!showStats);
  });

  if (exploreMode) {
    return <ExplorePannel onExit={() => setExploreMode(false)} />;
  }

  return (
    <div className={cx('page-editor')}>
      <div className={cx('actions')}>
        <div className={cx('btn')} onClick={() => addAbilityItem()}>
          写一条
        </div>
        <div className={cx('btn', { active: editMode })} onClick={handleEnterEditMode}>
          {editMode ? '退出修改' : '改标签'}
        </div>
        <div className={cx('btn')} onClick={() => setExploreMode(true)}>
          探索
        </div>
        <div className={cx('btn')} onClick={handleChangeFilterType}>
          筛选：
          <span className={cx('btn-tip')}>{filterType === 'some' ? '含有' : '重叠'}</span>
        </div>
        <div className={cx('btn')} onClick={handleChangeStatsMode}>
          统计：
          <span className={cx('btn-tip')}>{showStats ? '开' : '关'}</span>
        </div>
        <div className={cx('rights')}>
          <div className={cx('btn', 'icon')}>
            <TagPreview />
          </div>
          <div className={cx('btn', 'icon')} onClick={showSearch}>
            <IconSearch />
          </div>
        </div>
      </div>
      <DbTagPicker className={cx('root-tags-picker')} tags={tags} onClick={handleClickTag} showBadge={showStats} />
      {!!records?.length && (
        <div className={cx('records')}>
          <div className={cx('total')}>
            共 <span className={cx('num')}>{records.length}</span> 条
          </div>
          {records.map((x) => (
            <AbilityItem ability={x} key={x.id} />
          ))}
        </div>
      )}
      {!tags.length && !records?.length && !!items?.length && (
        <div className={cx('records')}>
          <div className={cx('total')}>
            共 <span className={cx('num')}>{items.length}</span> 条
          </div>
          {items.map((x) => (
            <AbilityItem ability={x} key={x.id} />
          ))}
        </div>
      )}
    </div>
  );
}
