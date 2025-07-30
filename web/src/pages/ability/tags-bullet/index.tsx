import cx from 'classnames';
import { getTag } from '../state';

export function TagsBullet({
  tags,
  onClick,
  className,
  size,
}: {
  tags: number[];
  onClick?: (tag: number) => void;
  className?: string;
  size?: 'sm' | 'lg';
}) {
  return (
    <div className={className}>
      {tags.map((x) => {
        const tag = getTag(x);
        if (!tag) return null;
        return (
          <span className={cx('g-tag', size || '', tag[1] || '')} key={x} onClick={() => onClick?.(x)}>
            {tag[0]}
          </span>
        );
      })}
    </div>
  );
}
