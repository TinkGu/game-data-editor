import { useEffect, useRef, useState } from 'react';
import { trim } from '@tinks/xeno';
import { useDebounceFn } from '@tinks/xeno/react';
import { Portal, toast } from 'app/components';
import { IconAll, IconCross, IconPick, IconSearch, IconTag } from 'app/components/icons';
import { fullIncludes, getIntersection } from 'app/utils/array';
import classnames from 'classnames/bind';
import { useAtomView } from 'use-atom-view';
import { AbilityExampleList, AbilityItem } from '../ability-item';
import { DbTagPicker } from '../factor-editor';
import { showSettings } from '../settings';
import { Ability, db, hasInExamples, store, toggleExample } from '../state';
import { TagsBullet } from '../tags-bullet';
import styles from './styles.module.scss';

const cx = classnames.bind(styles);

function getSearchResult(o: { keyword?: string; tags: number[] }) {
  const { filterType } = store.get();
  const { keyword, tags } = o;
  const res: Ability[] = [];
  const items = db.atom.get().items;
  items.forEach((x) => {
    let keywordMatch = !keyword && !!tags.length;
    let tagsMatch = !tags.length && !!keyword;
    if (keyword) {
      keywordMatch = x.name.includes(keyword) || x.desc.includes(keyword);
    }
    if (tags.length) {
      if (filterType === 'every') {
        tagsMatch = !!x.tags.length && fullIncludes(x.tags, tags);
      } else {
        tagsMatch = !!x.tags.length && !!getIntersection(x.tags, tags)?.length;
      }
    }
    if (keywordMatch && tagsMatch) {
      res.push(x);
    }
  });
  return res;
}

function SearchModal({ onDestory }: { onDestory: () => void }) {
  const { showStats, examples } = useAtomView(store);
  const [isPicking, setIsPicking] = useState(false);
  const [isPickTag, setIsPickTag] = useState(false);
  const [tags, setTags] = useState<number[]>([]);
  const [items, setItems] = useState<Ability[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSearch() {
    const keyword = trim(inputRef.current?.value);
    if (!keyword && !tags.length) {
      toast({ message: '请输入关键词' });
      return;
    }
    setItems(getSearchResult({ keyword, tags }));
    setIsPickTag(false);
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      console.log('enter');
      handleSearch();
    }
  };

  const handleClear = useDebounceFn(() => {
    inputRef.current!.value = '';
    setItems(getSearchResult({ keyword: '', tags }));
  });

  const handleTogglePicking = useDebounceFn(() => {
    setIsPicking((x) => !x);
  });

  const handleTogglePickTag = useDebounceFn(() => {
    setIsPickTag((x) => !x);
  });

  const handleClickTag = ({ id }: { id: number }) => {
    if (tags.includes(id)) {
      setTags(tags.filter((x) => x !== id));
    } else {
      setTags([...tags, id]);
    }
  };

  const handleClearTags = () => {
    setTags([]);
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setItems(getSearchResult({ keyword: inputRef.current?.value, tags }));
  }, [tags]);

  return (
    <div className={cx('ab-search')}>
      <div className={cx('header')}>
        <div className={cx('actions')}>
          <div className={cx('header-icon')} onClick={showSettings}>
            <IconAll />
          </div>
          <div className={cx('header-icon', { active: isPicking })} onClick={handleTogglePicking}>
            <IconPick />
          </div>
          <div className={cx('header-icon', { active: isPickTag })} onClick={handleTogglePickTag}>
            <IconTag />
          </div>
          <div className={cx('btn', 'close')} onClick={onDestory}>
            关闭
          </div>
        </div>
        <div className={cx('search-bar')}>
          <div className={cx('search-input')}>
            <input type="text" placeholder="搜索条目..." ref={inputRef} onKeyDown={handleKeyDown} />
            <div className={cx('clear-icon')} onClick={handleClear}>
              <IconCross />
            </div>
          </div>
          <div className={cx('search-icon-wrapper')}>
            <div className={cx('search-icon')} onClick={handleSearch}>
              <IconSearch />
            </div>
          </div>
        </div>
        {(!!tags.length || (isPicking && !!examples.length)) && (
          <div className={cx('results-box')}>
            <div>
              <TagsBullet className={cx('active-tags')} tags={tags} onClick={(x) => handleClickTag({ id: x })} />
              {isPicking && <AbilityExampleList abilities={examples} onClick={toggleExample} />}
            </div>
            <div className={cx('clear-tags')} onClick={handleClearTags}>
              <IconCross />
            </div>
          </div>
        )}
      </div>

      <div className={cx('content')}>
        {isPickTag && <DbTagPicker className={cx('search-tags')} tags={tags} onClick={handleClickTag} showBadge={showStats} />}
        {!items.length && <div className={cx('empty')}>找不到相关结果</div>}
        {!!items.length &&
          items.map((x) => (
            <AbilityItem ability={x} key={x.id} onClick={isPicking ? toggleExample : undefined} active={hasInExamples(x.id)} />
          ))}
      </div>
    </div>
  );
}

export function showSearch() {
  return Portal.show({
    content: (onDestory) => {
      return <SearchModal onDestory={onDestory} />;
    },
  });
}
