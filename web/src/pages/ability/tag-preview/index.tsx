import { useMemo } from 'react';
import { useDebounceFn } from '@tinks/xeno/react';
import { Portal } from 'app/components';
import { IconInfo } from 'app/components/icons';
import { TagItem } from 'app/components/tag';
import classnames from 'classnames/bind';
import { db } from '../state';
import styles from './styles.module.scss';

const cx = classnames.bind(styles);

/** 只筛选有 desc 的 tag */
function parseTags() {
  const tags = [] as TagItem[];
  const { tagMap } = db.atom.get();
  Object.keys(tagMap).forEach((x) => {
    const item = { id: Number(x), name: tagMap[x][0], color: tagMap[x][1], desc: tagMap[x][3] };
    if (item.desc) {
      tags.push(item);
    }
  });
  return tags;
}

export function TagPreviewModal({ onDestory }: { onDestory: () => void }) {
  const tags = useMemo(() => parseTags(), []);
  return (
    <div className={cx('tag-preview-modal')}>
      <div className={cx('actions')}>
        <div className={cx('btn', 'close')} onClick={onDestory}>
          关闭
        </div>
      </div>
      <div className={cx('content')}>
        {tags.map((x) => (
          <div key={x.id} className={cx('tag-wrap')}>
            <span className={cx('g-tag', x.color)} data-id={x.id} data-id-t="number">
              {x.name}
            </span>
            <div className={cx('tag-desc')}>{x.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function showTagPreview() {
  return Portal.show({
    content: (onDestory) => {
      return <TagPreviewModal onDestory={onDestory} />;
    },
  });
}

export function TagPreview({ className }: { className?: string }) {
  const handleClick = useDebounceFn(() => {
    showTagPreview();
  });

  return (
    <span className={cx('tag-preview-btn', className)} onClick={handleClick}>
      <IconInfo />
    </span>
  );
}
