import { useEffect, useMemo, useRef } from 'react';
import { trim } from '@tinks/xeno';
import { useDebounceFn } from '@tinks/xeno/react';
import { Modal, toast } from 'app/components';
import { TagItem, TagPicker } from 'app/components/tag';
import classnames from 'classnames/bind';
import { useAtomView } from 'use-atom-view';
import { db } from '../state';
import styles from '../styles.module.scss';

const cx = classnames.bind(styles);

interface TagGroupItem {
  name: string;
}

function toGroupList(map: Record<string, [string]>) {
  const res = [] as TagItem[];
  if (!map) {
    return res;
  }
  Object.keys(map).forEach((x) => {
    const name = map[x]?.[0];
    if (!name) {
      return;
    }
    res.push({
      id: Number(x),
      name,
    });
  });
  return res;
}

function GroupEditor({
  value,
  onSave,
  onDestory,
  onDelete,
}: {
  value?: TagGroupItem;
  onSave: (x: TagGroupItem) => void;
  onDestory: () => void;
  onDelete?: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDelete = useDebounceFn(async () => {
    try {
      await onDelete?.();
      onDestory();
    } catch (err) {
      console.error(err);
      toast.error(err);
    }
  });

  const handleSave = useDebounceFn(async () => {
    try {
      const name = trim(inputRef.current?.value || '');
      if (!name) {
        toast.info('未输入');
        return;
      }
      await onSave({ name });
      onDestory();
    } catch (err) {
      console.error(err);
      toast.error(err);
    }
  });

  useEffect(() => {
    if (!value) return;
    if (value.name) {
      inputRef.current!.value = value.name;
    }
  }, [value]);

  return (
    <div className={cx('factor-editor')}>
      <div className={cx('editor-actions')}>
        <div>
          <div className={cx('btn')} onClick={handleSave}>
            保存
          </div>
          {!!onDelete && (
            <div className={cx('btn', 'danger')} onClick={handleDelete}>
              删除
            </div>
          )}
        </div>
        <div className={cx('btn', 'close')} onClick={onDestory}>
          关闭
        </div>
      </div>
      <div className={cx('g-text-area')}>
        <input ref={inputRef} className={cx('g-input-style', 'transparent')} placeholder="输入" />
      </div>
    </div>
  );
}

/** 新增分类集合 */
const addGroup = () => {
  const onSave = async (value: TagGroupItem) => {
    const { groupMap } = db.atom.get();
    const names = Object.values(groupMap).map((x) => x[0]);
    if (names.includes(value.name)) {
      throw { message: '同名已存在' };
    }
    db.atom.modify((x) => ({
      ...x,
      groupMap: {
        ...x.groupMap,
        [db.uuid()]: [value.name],
      },
    }));
    await db.save();
  };

  Modal.show({
    type: 'half-screen',
    content: (onDestory) => (
      <div className={cx('modal')}>
        <GroupEditor onDestory={onDestory} onSave={onSave} />
      </div>
    ),
  });
};

const dumb = [];

export function GroupList({ onClick, value }: { value?: number; onClick: (x: number) => void }) {
  const { groupMap } = useAtomView(db.atom);
  const groupList = useMemo(() => toGroupList(groupMap), [groupMap]);

  const handleClick = ({ id }: { id: number }) => {
    onClick?.(id);
  };

  return (
    <div>
      <TagPicker simple tagList={groupList} value={value ? [value] : dumb} onClick={handleClick} onAdd={addGroup} />
    </div>
  );
}
