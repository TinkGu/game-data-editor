import { useState } from 'react';
import { getDataset } from '@tinks/xeno';
import { useDebounceFn } from '@tinks/xeno/react';
import classnames from 'classnames/bind';
import { useAtomView } from 'use-atom-view';
import { AbilityItem, addAbilityItem } from '../ability-item';
import { DbTagPicker } from '../factor-editor';
import { db, Ability, getTag } from '../state';
import styles from '../styles.module.scss';

const cx = classnames.bind(styles);

export function ExplorePannel({ onExit }: { onExit: () => void }) {
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
    <div className={cx('page-editor')}>
      <div className={cx('actions')}>
        <div className={cx('btn', 'active')} onClick={onExit}>
          退出探索
        </div>
      </div>

      <div className={cx('tip')}>选中标签后，只出现与这个标签有关的组合</div>
      <DbTagPicker disableAdd className={cx('root-tags-picker')} tags={tags} onClick={handleClickTag} />
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
                  <span className={cx('g-tag', tag[1] || '')} key={x}>
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
