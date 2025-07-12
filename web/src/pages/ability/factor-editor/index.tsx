import { useEffect, useRef, useState } from 'react';
import { trim } from '@tinks/xeno';
import { useDebounceFn } from '@tinks/xeno/react';
import { Modal, toast } from 'app/components';
import { ColorPicker, TagItem, TagPicker } from 'app/components/tag';
import classnames from 'classnames/bind';
import { useAtomView } from 'use-atom-view';
import { GroupList } from '../group-editor';
import { db, getTag, store } from '../state';
import styles from './styles.module.scss';

const cx = classnames.bind(styles);

export interface TagFactor {
  txt: string;
  color?: string;
  groupId?: number;
  desc?: string;
}

function FactorEditor({
  value,
  onSave,
  onDestory,
  onDelete,
}: {
  value?: TagFactor;
  onSave: (x: TagFactor) => void;
  onDestory: () => void;
  onDelete?: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLInputElement>(null);
  const [color, setColor] = useState('');
  const [groupId, setGroupId] = useState(0);

  const handleDelete = useDebounceFn(async () => {
    try {
      const isOk = await Modal.showAsync({
        type: 'confirm',
        content: '确定删除吗',
      });
      if (!isOk) return;
      await onDelete?.();
      onDestory();
    } catch (err) {
      console.error(err);
      toast.error(err);
    }
  });

  const handleSave = useDebounceFn(async () => {
    try {
      const txt = trim(inputRef.current?.value || '');
      const desc = trim(descRef.current?.value || '');
      if (!txt) {
        toast.info('未输入');
        return;
      }
      await onSave({ txt, color, groupId, desc });
      onDestory();
    } catch (err) {
      console.error(err);
      toast.error(err);
    }
  });

  useEffect(() => {
    if (!value) return;
    if (value.txt) {
      inputRef.current!.value = value.txt;
    }
    if (value.color) {
      setColor(value.color);
    }
    if (value.groupId) {
      setGroupId(value.groupId);
    }
    if (value.desc) {
      descRef.current!.value = value.desc;
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
        <input ref={inputRef} className={cx('g-input-style', 'transparent')} placeholder="标签" />
      </div>
      <div className={cx('g-text-area')}>
        <input ref={descRef} className={cx('g-input-style', 'transparent')} placeholder="描述" />
      </div>
      <ColorPicker value={color} onChange={setColor} />
      <GroupList value={groupId} onClick={setGroupId} />
    </div>
  );
}

/** 新增因子 */
const addFactor = () => {
  const onSave = async (value: TagFactor) => {
    const { tagMap } = db.atom.get();
    const names = Object.values(tagMap).map((x) => x[0]);
    if (names.includes(value.txt)) {
      throw { message: '同名标签已存在' };
    }
    db.atom.modify((x) => ({
      ...x,
      tagMap: {
        ...tagMap,
        [db.uuid()]: [value.txt, value.color || '', value.groupId || 0, value.desc || ''],
      },
    }));
    await db.save();
  };

  Modal.show({
    type: 'half-screen',
    content: (onDestory) => (
      <div className={cx('modal')}>
        <FactorEditor onDestory={onDestory} onSave={onSave} />
      </div>
    ),
  });
};

/** 修改因子 */
export const editFactor = ({ id }: { id: number }) => {
  const tag = getTag(id);
  const value = { txt: tag[0], color: tag[1], groupId: tag[2], desc: tag[3] };

  const onDelete = async () => {
    const { tagMap, items } = db.atom.get();
    delete tagMap[id];
    const nextItems = items.map((x) => {
      if (x.tags.includes(id)) {
        x.tags = x.tags.filter((y) => y !== id);
      }
      return x;
    });
    db.atom.modify((x) => ({
      ...x,
      tagMap: { ...tagMap },
      items: nextItems,
    }));
    await db.save();
  };

  const onSave = async (value: TagFactor) => {
    const { tagMap } = db.atom.get();
    const [txt, color, grouoId, desc] = tag;
    // 未修改，退出
    if (txt === value.txt && color === value.color && grouoId === value.groupId && desc == value.desc) return;

    if (txt !== value.txt) {
      const names = Object.values(tagMap).map((x) => x[0]);
      if (names.includes(value.txt)) {
        throw { message: '同名标签已存在' };
      }
    }
    db.atom.modify((x) => ({
      ...x,
      tagMap: {
        ...tagMap,
        [id]: [value.txt, value.color || '', value.groupId || 0, value.desc || ''],
      },
    }));
    await db.save();
  };

  Modal.show({
    type: 'half-screen',
    content: (onDestory) => (
      <div className={cx('modal')}>
        <FactorEditor onDestory={onDestory} onSave={onSave} value={value} onDelete={onDelete} />
      </div>
    ),
  });
};

export function DbTagPicker({
  disableAdd,
  tags,
  className = '',
  onClick,
  showBadge,
}: {
  tags: number[];
  className?: string;
  disableAdd?: boolean;
  showBadge?: boolean;
  onClick: (x: { id: number }) => void;
}) {
  const { tagMap, groupMap } = useAtomView(db.atom);
  const { stats } = store.get();
  const tagList = [] as TagItem[];
  const categroyMap = {} as Record<number, TagItem[]>;
  Object.keys(tagMap).forEach((x) => {
    const grouoId = tagMap[x]?.[2] || 0;
    const item = { id: Number(x), name: tagMap[x][0], color: tagMap[x][1], badge: stats[Number(x)] || 0 };
    if (!grouoId) {
      tagList.push(item);
      return;
    }
    if (!categroyMap[grouoId]) {
      categroyMap[grouoId] = [];
    }
    categroyMap[grouoId].push(item);
  });

  return (
    <div className={cx(className)}>
      <TagPicker key={0} tagList={tagList} onClick={onClick} onAdd={addFactor} value={tags} disableAdd={disableAdd} showBadge={showBadge} />
      {Object.keys(categroyMap).map((gid) => (
        <TagPicker
          prefix={<span className={cx('category-label')}>{groupMap[gid]?.[0] || ''}</span>}
          key={gid}
          tagList={categroyMap[gid]}
          onClick={onClick}
          value={tags}
          disableAdd
          showBadge={showBadge}
        />
      ))}
    </div>
  );
}
