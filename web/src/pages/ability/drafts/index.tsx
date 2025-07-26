import { useDebounceFn } from '@tinks/xeno/react';
import { Modal, Portal, toast } from 'app/components';
import { IconDislike, IconSave } from 'app/components/icons';
import classnames from 'classnames/bind';
import { useAtomView } from 'use-atom-view';
import { AbilityItem, checkAbility, showAbilityEditor } from '../ability-item';
import { Ability, db, draftDb } from '../state';
import { showTagPreview } from '../tag-preview';
import styles from './styles.module.scss';

const cx = classnames.bind(styles);

function DraftItem({ ability, id }: { ability: Ability; id: number }) {
  const handleDelete = useDebounceFn(() => {
    draftDb.atom.modify((state) => ({
      ...state,
      items: state.items.filter((_, i) => i !== id),
    }));
    draftDb.save();
  });

  const handleSave = useDebounceFn(async () => {
    try {
      const item = checkAbility({
        name: ability.name,
        desc: ability.desc,
        tags: ability.tags,
      });
      db.atom.modify((x) => ({
        ...x,
        items: [item, ...x.items],
      }));
      await db.save();
      handleDelete();
    } catch (err) {
      console.error(err);
      toast.error(err);
    }
  });

  const handleClick = useDebounceFn((ability: Ability) => {
    showAbilityEditor({
      ability,
      onSave: handleSave,
      onDelete: handleDelete,
    });
  });

  return (
    <div className={cx('draft-card')}>
      <AbilityItem ability={ability} onClick={handleClick} />
      <div className={cx('card-header')}>
        <div className={cx('rights')}>
          <div className={cx('card-action')} onClick={handleDelete}>
            <div className={cx('icon')}>
              <IconDislike />
            </div>
            <div className={cx('text')}>不喜欢</div>
          </div>
          <div className={cx('card-action')} onClick={handleSave}>
            <div className={cx('icon')}>
              <IconSave />
            </div>
            <div className={cx('text')}>保存</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DraftsPannel({ onDestory }: { onDestory: () => void }) {
  const { items } = useAtomView(draftDb.atom);
  const handleClear = useDebounceFn(async () => {
    const isOk = await Modal.showAsync({
      type: 'confirm',
      content: '确定清空草稿箱吗',
    });
    if (!isOk) return;
    draftDb.atom.merge({ items: [] });
    draftDb.save();
  });

  return (
    <div className={cx('page-drafts')}>
      <div className={cx('header')}>
        <div className={cx('actions')}>
          <div className={cx('btn')}>共{items.length}条</div>
          <div className={cx('btn', 'danger')} onClick={handleClear}>
            清空
          </div>
          <div className={cx('btn')} onClick={showTagPreview}>
            标签说明
          </div>
          <div className={cx('btn', 'close')} onClick={onDestory}>
            退出
          </div>
        </div>
      </div>
      <div className={cx('content')}>
        {!items.length && <div className={cx('empty')}>草稿箱为空</div>}
        {!!items.length && items.map((item, i) => <DraftItem ability={item} key={i} id={i} />)}
      </div>
    </div>
  );
}

export function showDrafts() {
  return Portal.show({
    content: (onDestory) => {
      return <DraftsPannel onDestory={onDestory} />;
    },
  });
}
