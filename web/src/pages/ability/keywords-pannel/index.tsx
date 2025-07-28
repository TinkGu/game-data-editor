import { useEffect, useRef, useState } from 'react';
import { getDataset, trim } from '@tinks/xeno';
import { useDebounceFn } from '@tinks/xeno/react';
import { Portal } from 'app/components';
import classnames from 'classnames/bind';
import { useAtomView } from 'use-atom-view';
import { keywordsDb } from '../state';
import styles from './styles.module.scss';

const cx = classnames.bind(styles);

function KeywordsPannel({ onDestory, onSave }: { onDestory: () => void; onSave: (keywords: string[]) => void }) {
  const { items } = useAtomView(keywordsDb.atom);
  const [selected, setSelected] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelectKeyword = useDebounceFn((e: any) => {
    const { keyword } = getDataset(e);
    setSelected((prev) => {
      if (prev.includes(keyword)) {
        return prev.filter((x) => x !== keyword);
      }
      return [...prev, keyword];
    });
  });

  const handleSave = useDebounceFn(() => {
    const custom = inputRef.current?.value || '';
    const customKeywords = trim(custom)
      ?.split(/[\s,，]+/)
      .filter((x) => !!x);
    const keywords = [...selected, ...customKeywords];
    const uniqueKeywords = keywords.filter((x, i, arr) => arr.indexOf(x) === i);
    if (uniqueKeywords.length) {
      onSave(uniqueKeywords);
    }
    onDestory();
  });

  useEffect(() => {
    keywordsDb.pull();
  }, []);

  return (
    <div className={cx('keywords-pannel')}>
      <div className={cx('header')}>
        <div className={cx('actions')}>
          <div className={cx('btn')}>关键词库</div>
          <div className={cx('btn', 'active')} onClick={handleSave}>
            保存
          </div>
          <div className={cx('btn', 'close')} onClick={onDestory}>
            退出
          </div>
        </div>
      </div>
      <div className={cx('content')}>
        <div className={cx('input-section')}>
          <input ref={inputRef} className={cx('g-input-style')} placeholder="自定义，多个用空格或逗号分开" />
        </div>
        {items.map((x) => (
          <div className={cx('keyword-group')} key={x.name}>
            <div className={cx('section')}>{x.name}</div>
            {x.keywords.map((y) => (
              <span key={y} className={cx('g-tag', selected.includes(y) ? 'red' : 'grey')} onClick={handleSelectKeyword} data-keyword={y}>
                {y}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function showKeywords({ onSave }: { onSave: (keywords: string[]) => void }) {
  return Portal.show({
    content: (onDestory) => {
      return <KeywordsPannel onDestory={onDestory} onSave={onSave} />;
    },
  });
}
