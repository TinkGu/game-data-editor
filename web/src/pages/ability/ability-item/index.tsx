import { useEffect, useRef, useState } from 'react';
import { getDataset, trim } from '@tinks/xeno';
import { useDebounceFn, useThrottleFn } from '@tinks/xeno/react';
import { Modal, toast } from 'app/components';
import { IconAi, IconAiDelete, IconAiDesc, IconKeywords, IconTag } from 'app/components/icons';
import { searchSames } from 'app/utils/ability-services';
import classnames from 'classnames/bind';
import { DbTagPicker } from '../factor-editor';
import { showKeywords } from '../keywords-pannel';
import { llmAbilityDesc, llmAbilityName, llmAbilityTags } from '../llm';
import { showSames } from '../same-pannel';
import { Ability, db, getTag } from '../state';
import { TagPreview } from '../tag-preview';
import { TagsBullet } from '../tags-bullet';
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
  const handleDelete = async () => {
    db.atom.modify((x) => ({
      ...x,
      items: x.items.filter((x) => x.id !== ability.id),
    }));
    await db.save();
  };

  const handleSave = async (value: Ability) => {
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
        <AbilityEditor value={ability} onDestory={onDestory} onSave={handleSave} onDelete={handleDelete} />
      </div>
    ),
  });
};

export function showAbilityEditor({
  ability,
  onSave,
  onDelete,
}: {
  ability: Ability;
  onSave: (ability: Ability) => void;
  onDelete?: () => void;
}) {
  return Modal.show({
    wrapperClassName: cx('ab-editor-modal'),
    type: 'half-screen',
    content: (onDestory) => <AbilityEditor value={ability} onDestory={onDestory} onSave={onSave} onDelete={onDelete} />,
  });
}

export function checkAbility(ability: Omit<Ability, 'id'> & { id?: number }) {
  const name = trim(ability.name || '');
  const desc = trim(ability.desc || '');
  const tags = ability.tags.filter((x) => getTag(x));
  if (!name) throw new Error('未输入name');
  if (!desc) throw new Error('未输入desc');
  if (!tags?.length) throw new Error('至少输入一个标签');

  return {
    id: ability.id || db.uuid(),
    name,
    desc,
    tags,
  };
}

export function AbilityItem({
  ability,
  disabled,
  onClick = editAbilityItem,
}: {
  ability: Ability;
  disabled?: boolean;
  onClick?: (ability: Ability) => void;
}) {
  const handleEdit = useDebounceFn(() => {
    if (disabled) return;
    onClick?.(ability);
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
  const [aiNames, setAiNames] = useState<string[]>([]);
  const [aiDescs, setAiDescs] = useState<string[]>([]);
  const [aiTags, setAiTags] = useState<number[][]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [sameCount, setSameCount] = useState(0);

  const handleFindSames = useThrottleFn(() => {
    const sames = searchSames(
      {
        id: value?.id || -1,
        name: trim(nameRef.current?.value || ''),
        desc: trim(descRef.current?.value || ''),
        tags: abTags,
      },
      db.atom.get().items,
    );
    setSameCount(sames.length);
  }, 5000);

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

      const ability = checkAbility({
        id: value?.id,
        name,
        desc,
        tags,
      });
      await onSave(ability);
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
    handleFindSames();
  };

  const handleAiName = useDebounceFn(async () => {
    if (isAiLoading) return;
    if (!trim(descRef.current?.value || '')) return toast.error('请先输入描述');
    if (!abTags.length) return toast.error('请先至少输入 1 个标签');
    try {
      setIsAiLoading(true);
      const res = await llmAbilityName({ tags: abTags, desc: descRef.current!.value, keywords });
      if (res?.items?.length) {
        setAiNames(res.items);
      }
    } catch (err) {
      console.error(err);
      toast.error(err);
    }
    setIsAiLoading(false);
  });

  const handleUseAiName = useDebounceFn((e: any) => {
    const { name } = getDataset(e);
    if (!name) return;
    nameRef.current!.value = name;
    setAiNames([]);
    handleFindSames();
  });

  const handleAiDesc = useDebounceFn(async () => {
    if (isAiLoading) return;
    if (!abTags.length) return toast.error('请先至少输入 1 个标签');
    try {
      setIsAiLoading(true);
      const res = await llmAbilityDesc({ tags: abTags, name: nameRef.current?.value || '' });
      if (res?.items?.length) {
        setAiDescs(res.items);
      }
    } catch (err) {
      console.error(err);
      toast.error(err);
    }
    setIsAiLoading(false);
  });

  const handleUseAiDesc = useDebounceFn((desc: string) => {
    descRef.current!.value = desc;
    setAiDescs([]);
    adjustHeight();
  });

  const handleClearDesc = useDebounceFn(() => {
    descRef.current!.value = '';
    adjustHeight();
  });

  const handleClickActiveTag = useDebounceFn((tag: number) => {
    if (abTags.includes(tag)) {
      setAbTags(abTags.filter((x) => x !== tag));
      handleFindSames();
    }
  });

  const handleAiTags = useDebounceFn(async () => {
    if (isAiLoading) return;
    try {
      setIsAiLoading(true);
      const res = await llmAbilityTags({ tags: abTags, name: nameRef.current?.value || '', desc: descRef.current?.value || '' });
      if (res?.items?.length) {
        setAiTags(res.items);
      }
    } catch (err) {
      console.error(err);
      toast.error(err);
    }
    setIsAiLoading(false);
  });

  const handleUseAiTags = useDebounceFn((tags: number[]) => {
    setAbTags(tags);
    setAiTags([]);
    handleFindSames();
  });

  const handleKeywords = useDebounceFn(() => {
    const onSave = (keywords: string[]) => {
      setKeywords(keywords);
    };
    showKeywords({ onSave });
  });

  useEffect(() => {
    if (!value) return;
    if (value.name) {
      nameRef.current!.value = value.name;
    }
    if (value.desc) {
      descRef.current!.value = value.desc;
      adjustHeight();
    }
    if (value.tags?.length) {
      setAbTags(value.tags);
    }
  }, [value]);

  useEffect(() => {
    if (!value) return;
    const hasContent = value.id || value.name || value.desc || value.tags?.length;
    if (!hasContent) return;
    const sames = searchSames(value, db.atom.get().items);
    setSameCount(sames.length);
  }, [value]);

  return (
    <div className={cx('ability-editor', { 'has-same': sameCount > 0 })}>
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
      <div className={cx('same-tip')} onClick={showSames}>
        发现 <span className={cx('same-tip-count')}>{sameCount}</span> 个相似条目
      </div>
      <div className={cx('title-input')}>
        <span className={cx('sharp')}>#</span>
        <input ref={nameRef} className={cx('g-input-style', 'transparent', 'title')} placeholder="标题" onChange={handleFindSames} />
        <div className={cx('actions')}>
          <div className={cx('ai-btn')} onClick={handleAiName}>
            {isAiLoading ? <span className={cx('loading-txt')}>生成中...</span> : <IconAi className={cx('ai-icon')} />}
          </div>
          {!isAiLoading && (
            <div className={cx('ai-btn')} onClick={handleAiDesc}>
              <IconAiDesc className={cx('ai-icon')} />
            </div>
          )}
          {!isAiLoading && (
            <div className={cx('ai-btn')} onClick={handleAiTags}>
              <IconTag className={cx('ai-icon')} />
            </div>
          )}
          <div className={cx('ai-btn')} onClick={handleKeywords}>
            <IconKeywords className={cx('ai-icon')} />
          </div>
          <div className={cx('ai-btn')} onClick={handleClearDesc}>
            <IconAiDelete className={cx('ai-icon')} />
          </div>
        </div>
      </div>
      {!!keywords.length && (
        <div className={cx('keyword-section')}>
          <span className={cx('tip')}>联想关键词：</span>
          <span className={cx('keywords')}>{keywords.join(',')}</span>
          <span className={cx('close')} onClick={() => setKeywords([])}>
            清除
          </span>
        </div>
      )}
      {aiNames.length > 0 && (
        <div className={cx('ai-names')}>
          {aiNames.map((x) => (
            <div className={cx('ai-name')} key={x} data-name={x} onClick={handleUseAiName}>
              {x}
            </div>
          ))}
        </div>
      )}
      <textarea
        ref={descRef}
        className={cx('g-input-style', 'transparent', 'desc-input')}
        placeholder="描述"
        onInput={adjustHeight}
        rows={1}
      />
      {aiDescs.length > 0 && (
        <div className={cx('ai-descs')}>
          {aiDescs.map((x) => (
            <div className={cx('ai-desc')} key={x} data-desc={x} onClick={() => handleUseAiDesc(x)}>
              {x}
            </div>
          ))}
          <div className={cx('close')} onClick={() => setAiDescs([])}>
            清除
          </div>
        </div>
      )}
      <TagsBullet tags={abTags} onClick={handleClickActiveTag} size="sm" />
      {aiTags.length > 0 && (
        <div className={cx('ai-tags')}>
          {aiTags.map((x, i) => (
            <div className={cx('ai-tag-item')} key={i} onClick={() => handleUseAiTags(x)}>
              <TagsBullet tags={x} size="sm" />
            </div>
          ))}
        </div>
      )}
      <DbTagPicker tags={abTags} onClick={handleClickTag} className={cx('tags-picker')} />
    </div>
  );
}
