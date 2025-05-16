import { ReactNode } from 'react';
import classnames from 'classnames/bind';
import { getDataset } from 'xeno/event';
import { useDebounceFn } from 'xeno/react';
import styles from './styles.module.scss';

const cx = classnames.bind(styles);

export interface TagItem {
  id: number;
  name: string;
  color?: string;
}

export function TagPicker({
  disableAdd,
  value,
  tagList,
  className = '',
  onClick,
  onAdd,
  sm,
  simple,
  prefix,
}: {
  value?: number[];
  tagList: TagItem[];
  className?: string;
  disabled?: boolean;
  disableAdd?: boolean;
  onAdd?: () => void;
  onClick: (x: { id: number }) => void;
  sm?: boolean;
  simple?: boolean;
  prefix?: ReactNode;
}) {
  const handleClickTag = (e: any) => {
    const { id } = getDataset(e);
    onClick?.({ id });
  };

  const handleAdd = useDebounceFn(() => {
    onAdd?.();
  });

  return (
    <div className={cx('tags-area', className)}>
      {prefix}
      {!disableAdd && (
        <span className={cx('g-tag')} onClick={handleAdd}>
          +
        </span>
      )}
      {tagList.map((x) => (
        <span
          className={cx('g-tag', { active: value?.includes(x.id), sm, simple }, x.color)}
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

export function ColorPicker({ value, onChange }: { value?: string; onChange?: (x: string) => void }) {
  const colors = ['grey', 'red', 'yellow', 'green', 'grass', 'blue', 'purple', 'purples'];
  return (
    <div className={cx('color-picker')}>
      {colors.map((x) => (
        <span key={x} className={cx('g-tag', x, { active: x === value })} onClick={() => onChange?.(x)}>
          色
        </span>
      ))}
    </div>
  );
}
