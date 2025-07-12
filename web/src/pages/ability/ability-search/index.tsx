import { useEffect, useRef, useState } from 'react';
import { trim } from '@tinks/xeno';
import { useDebounceFn } from '@tinks/xeno/react';
import { Portal, toast } from 'app/components';
import { IconCross, IconSearch } from 'app/components/icons';
import classnames from 'classnames/bind';
import { AbilityItem } from '../ability-item';
import { Ability, db } from '../state';
import styles from './styles.module.scss';

const cx = classnames.bind(styles);

function getSearchResult(keyword: string) {
  return db.atom.get().items.filter((x) => x.name.includes(keyword) || x.desc.includes(keyword));
}

function SearchModal({ onDestory }: { onDestory: () => void }) {
  const [items, setItems] = useState<Ability[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSearch() {
    const keyword = trim(inputRef.current?.value);
    if (!keyword) {
      toast({ message: '请输入关键词' });
      return;
    }
    setItems(getSearchResult(keyword));
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      console.log('enter');
      handleSearch();
    }
  };

  const handleClear = useDebounceFn(() => {
    inputRef.current!.value = '';
    setItems([]);
  });

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className={cx('ab-search')}>
      <div className={cx('header')}>
        <div className={cx('actions')}>
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
      </div>

      <div className={cx('content')}>
        {!items.length && <div className={cx('empty')}>找不到相关结果</div>}
        {!!items.length && items.map((item) => <AbilityItem ability={item} key={item.id} />)}
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
