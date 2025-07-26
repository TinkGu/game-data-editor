import { useEffect, useRef, useState } from 'react';
import { trim } from '@tinks/xeno';
import { useDebounceFn } from '@tinks/xeno/react';
import { Modal, toast } from 'app/components';
import classnames from 'classnames/bind';
import { DbTagPicker } from '../factor-editor';
import { Ability, db, getTag } from '../state';
import { TagPreview } from '../tag-preview';
import styles from './styles.module.scss';

const cx = classnames.bind(styles);

export const addAbilityItem = (part?: Partial<Ability>) => {
  const onSave = async (value: Ability) => {
    db.atom.modify((x) => ({
      ...x,
      items: [value, ...x.items],
    }));
    await db.save();
  };

  Modal.show({
    wrapperClassName: cx('ab-editor-modal'),
    type: 'half-screen',
    content: (onDestory) => (
      <div className={cx('modal')}>
        <AbilityEditor value={part as any} onDestory={onDestory} onSave={onSave} />
      </div>
    ),
  });
};

export const editAbilityItem = (ability: Ability) => {
  const onDelete = async () => {
    db.atom.modify((x) => ({
      ...x,
      items: x.items.filter((x) => x.id !== ability.id),
    }));
    await db.save();
  };

  const onSave = async (value: Ability) => {
    db.atom.modify((x) => ({
      ...x,
      items: x.items.map((x) => (x.id === value.id ? value : x)),
    }));
    await db.save();
  };

  Modal.show({
    wrapperClassName: cx('ab-editor-modal'),
    type: 'half-screen',
    content: (onDestory) => (
      <div className={cx('modal')}>
        <AbilityEditor value={ability} onDestory={onDestory} onSave={onSave} onDelete={onDelete} />
      </div>
    ),
  });
};

export function AbilityItem({ ability }: { ability: Ability }) {
  const handleEdit = useDebounceFn(() => {
    editAbilityItem(ability);
  });

  return (
    <div className={cx('ability-item')} onClick={handleEdit}>
      <div>
        <span className={cx('name')}>{ability.name}</span>
        <span className={cx('desc')}>{ability.desc}</span>
      </div>
      <div className={cx('tags')}>
        {ability.tags.map((x) => {
          const tag = getTag(x);
          if (!tag) return null;
          return (
            <span className={cx('g-tag', 'sm', tag[1] || '')} key={x}>
              {tag[0]}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/** 新增特性 */
function AbilityEditor({
  value,
  onSave,
  onDestory,
  onDelete,
}: {
  value?: Ability;
  onSave: (x: Ability) => void;
  onDestory: () => void;
  onDelete?: () => void;
}) {
  const nameRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const [abTags, setAbTags] = useState<number[]>([]);

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
      const name = trim(nameRef.current?.value || '');
      const desc = trim(descRef.current?.value || '');
      const tags = abTags.filter((x) => getTag(x));
      if (!name) return toast.info('未输入name');
      if (!desc) return toast.info('未输入desc');
      if (!tags?.length) return toast.info('至少输入一个标签');

      await onSave({
        id: value?.id || db.uuid(),
        name,
        desc,
        tags,
      });
      onDestory();
    } catch (err) {
      console.error(err);
      toast.error(err);
    }
  });

  const adjustHeight = () => {
    if (descRef.current) {
      descRef.current.style.height = 'auto'; // 先重置高度，以便减少内容时能正确缩小
      descRef.current.style.height = `${descRef.current.scrollHeight}px`; // 然后设置高度为滚动高度
    }
  };

  const handleClickTag = ({ id }: { id: number }) => {
    if (abTags.includes(id)) {
      setAbTags(abTags.filter((x) => x !== id));
    } else {
      setAbTags([...abTags, id]);
    }
  };

  useEffect(() => {
    if (!value) return;
    if (value.name) {
      nameRef.current!.value = value.name;
    }
    if (value.desc) {
      descRef.current!.value = value.desc;
    }
    if (value.tags?.length) {
      setAbTags(value.tags);
    }
  }, [value]);

  return (
    <div className={cx('ability-editor')}>
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
          <div className={cx('btn', 'info')}>
            <TagPreview />
          </div>
        </div>
        <div className={cx('btn', 'close')} onClick={onDestory}>
          关闭
        </div>
      </div>
      <div className={cx('g-text-area')}>
        <span className={cx('sharp')}>#</span>
        <input ref={nameRef} className={cx('g-input-style', 'transparent', 'title')} placeholder="标题" />
      </div>
      <div>
        <textarea ref={descRef} className={cx('g-input-style', 'transparent')} placeholder="描述" onInput={adjustHeight} />
      </div>
      <div>
        {abTags.map((x) => {
          const tag = getTag(x);
          if (!tag) return null;
          return (
            <span className={cx('g-tag', 'sm', tag[1] || '')} key={x}>
              {tag[0]}
            </span>
          );
        })}
      </div>
      <DbTagPicker tags={abTags} onClick={handleClickTag} className={cx('tags-picker')} />
    </div>
  );
}
