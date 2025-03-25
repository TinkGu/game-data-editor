import { useEffect, useRef, useState } from 'react';
import { Modal, toast } from 'app/components';
import classnames from 'classnames/bind';
import { Atom, useAtomView } from 'use-atom-view';
import { getDataset } from 'xeno/event';
import { useDebounceFn } from 'xeno/react';
import { trim } from 'xeno/string';
import { JsonDb } from '../../utils/json-service';
import styles from './styles.module.scss';

const cx = classnames.bind(styles);

/** 获取两个数组的交集 */
function getIntersection(a: any[], b: any[]) {
  if (!a.length || !b.length) {
    return [];
  }
  return a.filter((x) => b.indexOf(x) > -1);
}

interface Ability {
  id: number;
  name: string;
  desc: string;
  tags: number[];
  category: string;
}

const db = new JsonDb({
  repo: 'private-cloud',
  path: 'match3/ability',
  atom: Atom.of({
    items: [] as Ability[],
    tagMap: {} as Record<number, [string, string]>,
  }),
});

const store = Atom.of({
  /** 当前圈选的 tags */
  tags: [] as number[],
});

function getTag(tagId: number) {
  return db.atom.get().tagMap[tagId];
}

function AbilityItem({ ability }: { ability: Ability }) {
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
            <span className={cx('tag', 'sm', tag[1] || '')} key={x}>
              {tag[0]}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function ColorPicker({ value, onChange }: { value?: string; onChange?: (x: string) => void }) {
  const colors = ['grey', 'red', 'yellow', 'green', 'grass', 'blue', 'purple', 'purples'];
  return (
    <div className={cx('color-picker')}>
      {colors.map((x) => (
        <span key={x} className={cx('tag', x, { active: x === value })} onClick={() => onChange?.(x)}>
          色
        </span>
      ))}
    </div>
  );
}

interface TagFactor {
  txt: string;
  color?: string;
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
  const [color, setColor] = useState('');

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
      const txt = trim(inputRef.current?.value || '');
      if (!txt) {
        toast.info('未输入');
        return;
      }
      await onSave({ txt, color });
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
      <div className={cx('text-area')}>
        <input ref={inputRef} className={cx('input-style', 'transparent')} placeholder="输入" />
      </div>
      <ColorPicker value={color} onChange={setColor} />
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
        [db.uuid()]: [value.txt, value.color || ''],
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
const editFactor = ({ id }: { id: number }) => {
  const tag = getTag(id);
  const value = { txt: tag[0], color: tag[1] };

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
    const [txt, color] = tag;
    // 未修改，退出
    if (txt === value.txt && color === value.color) return;

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
        [id]: [value.txt, value.color || ''],
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

function TagPicker({
  disableAdd,
  tags,
  className = '',
  onClickTag,
}: {
  tags: number[];
  className?: string;
  onClickTag: (x: { id: number }) => void;
  disableAdd?: boolean;
}) {
  const { tagMap } = useAtomView(db.atom);
  const tagList = Object.keys(tagMap).map((x) => ({ id: Number(x), name: tagMap[x][0], color: tagMap[x][1] || '' }));
  const handleClickTag = (e: any) => {
    const { id } = getDataset(e);
    onClickTag?.({ id });
  };
  return (
    <div className={cx('tags-area', className)}>
      {!disableAdd && (
        <span className={cx('tag')} onClick={addFactor}>
          +
        </span>
      )}
      {tagList.map((x) => (
        <span
          className={cx('tag', { active: tags.includes(x.id) }, x.color)}
          key={x.id}
          data-id={x.id}
          data-id-t="number"
          onClick={handleClickTag}
        >
          {x.name}
        </span>
      ))}
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
      if (!name) return toast.info('未输入name');
      if (!desc) return toast.info('未输入desc');
      if (!abTags?.length) return toast.info('至少输入一个标签');
      await onSave({
        id: value?.id || db.uuid(),
        name,
        desc,
        tags: abTags,
        category: '',
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
      <div className={cx('text-area')}>
        # <input ref={nameRef} className={cx('input-style', 'transparent')} placeholder="标题" />
      </div>
      <div className={cx('text-area')}>
        <textarea ref={descRef} className={cx('input-style', 'transparent')} placeholder="描述" onInput={adjustHeight} />
      </div>
      <div className={cx('tags')}>
        {abTags.map((x) => {
          const tag = getTag(x);
          if (!tag) return null;
          return (
            <span className={cx('tag', 'sm', tag[1] || '')} key={x}>
              {tag[0]}
            </span>
          );
        })}
      </div>
      <TagPicker tags={abTags} onClickTag={handleClickTag} className="tags-picker" />
    </div>
  );
}

const addAbilityItem = (part?: Partial<Ability>) => {
  const onSave = async (value: Ability) => {
    db.atom.modify((x) => ({
      ...x,
      items: [value, ...x.items],
    }));
    await db.save();
  };

  Modal.show({
    type: 'half-screen',
    content: (onDestory) => (
      <div className={cx('modal')}>
        <AbilityEditor value={part as any} onDestory={onDestory} onSave={onSave} />
      </div>
    ),
  });
};

const editAbilityItem = (ability: Ability) => {
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
    type: 'half-screen',
    content: (onDestory) => (
      <div className={cx('modal')}>
        <AbilityEditor value={ability} onDestory={onDestory} onSave={onSave} onDelete={onDelete} />
      </div>
    ),
  });
};

function ExplorePannel({ onExit }: { onExit: () => void }) {
  const { items, tagMap } = useAtomView(db.atom);
  const [tags, setTags] = useState<number[]>([]);
  const { ungroups, groups } = parseGroup();

  function parseGroup() {
    const ids = Object.keys(tagMap).map((x) => Number(x));
    const n = ids.length;
    let _ungroups: number[][] = [];
    let _groups: Ability[] = items;
    for (let i = 0; i < n; i++) {
      const a = ids[i];
      for (let j = i + 1; j < n; j++) {
        const b = ids[j];
        let hasGroup = false;
        for (let item of items) {
          if (item.tags.includes(a) && item.tags.includes(b)) {
            hasGroup = true;
            break;
          }
        }
        if (!hasGroup) {
          _ungroups.push([a, b]);
        }
      }
    }
    if (tags.length) {
      const t = tags[0];
      _ungroups = _ungroups.filter((x) => x.includes(t));
      _groups = _groups.filter((x) => x.tags.includes(t));
    }
    return { ungroups: _ungroups, groups: _groups };
  }

  const handleClickTag = ({ id }: { id: number }) => {
    if (id === tags[0]) {
      setTags([]);
    } else {
      setTags([id]);
    }
  };

  const handleAdd = useDebounceFn((e: any) => {
    const { a, b } = getDataset(e);
    addAbilityItem({ tags: [a, b] });
  });

  return (
    <div className={cx('ability-editor')}>
      <div className={cx('actions')}>
        <div className={cx('btn', 'active')} onClick={onExit}>
          退出探索
        </div>
      </div>

      <div className={cx('tip')}>选中标签后，只出现与这个标签有关的组合</div>
      <TagPicker disableAdd className={cx('root-tags-picker')} tags={tags} onClickTag={handleClickTag} />
      <div className={cx('section')}>
        <span className={cx('label')}>未发现的组合</span>
        <span className={cx('tip')}>点击组合可以快速创建</span>
      </div>
      <div className={cx('tag-groups')}>
        {ungroups?.map((g) => (
          <div className={cx('tag-group')} key={g[0] + '_' + g[1]}>
            <div onClick={handleAdd} data-a={g[0]} data-a-t="number" data-b={g[1]} data-b-t="number">
              {g.map((x) => {
                const tag = getTag(x);
                if (!tag) return null;
                return (
                  <span className={cx('tag', tag[1] || '')} key={x}>
                    {tag[0]}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className={cx('section')}>
        <span className={cx('label')}>已发现的组合</span>
      </div>
      {!!groups?.length && (
        <div className={cx('records')}>
          {groups.map((x) => (
            <AbilityItem ability={x} key={x.id} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PageEditorAbilityList() {
  const { tags } = useAtomView(store);
  const { items } = useAtomView(db.atom);
  const [records, setRecords] = useState<Ability[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [exploreMode, setExploreMode] = useState(false);
  const [filterType, setFilterType] = useState<'some' | 'every'>('some');

  useEffect(() => {
    if (tags.length) {
      const list = db.atom.get().items;
      const next = list.filter((x) => x.tags?.length && getIntersection(x.tags, tags)?.length);
      setRecords(next);
    }
  }, [tags, items]);

  useEffect(() => {
    db.pull();
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

  if (exploreMode) {
    return <ExplorePannel onExit={() => setExploreMode(false)} />;
  }

  return (
    <div className={cx('ability-editor')}>
      <div className={cx('actions')}>
        <div className={cx('btn', { active: editMode })} onClick={handleEnterEditMode}>
          {editMode ? '退出编辑' : '编辑标签'}
        </div>
        <div className={cx('btn')} onClick={() => addAbilityItem()}>
          新增条目
        </div>
        <div className={cx('btn')} onClick={() => setExploreMode(true)}>
          探索未知
        </div>
        <div className={cx('btn')} onClick={handleChangeFilterType}>
          过滤方式：
          <span className={cx('btn-tip')}>{filterType === 'some' ? '含有' : '重叠'}</span>
        </div>
      </div>
      <TagPicker className={cx('root-tags-picker')} tags={tags} onClickTag={handleClickTag} />
      {!!records?.length && (
        <div className={cx('records')}>
          {records.map((x) => (
            <AbilityItem ability={x} key={x.id} />
          ))}
        </div>
      )}
      {!records?.length && !!items?.length && (
        <div className={cx('records')}>
          {items.map((x) => (
            <AbilityItem ability={x} key={x.id} />
          ))}
        </div>
      )}
    </div>
  );
}
