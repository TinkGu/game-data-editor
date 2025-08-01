import { useEffect } from 'react';
import { Portal } from 'app/components';
import { deleteHistory, historyAtom, HistoryRecord } from 'app/utils/history';
import classnames from 'classnames/bind';
import { useAtomView } from 'use-atom-view';
import { AbilityExampleList } from '../ability-item';
import { Ability, db, store } from '../state';
import { TagsBullet } from '../tags-bullet';
import styles from './styles.module.scss';

const cx = classnames.bind(styles);

let _memos: Record<number, Ability> | undefined;

function createMemo() {
  const { items } = db.atom.get();
  const map = items.reduce((acc, x) => {
    acc[x.id] = x;
    return acc;
  }, {} as Record<number, Ability>);
  _memos = map;
  return map;
}

function getAbilities(ids?: number[]) {
  if (!ids) {
    return [];
  }
  if (!_memos) {
    createMemo();
  }
  return ids.map((x) => _memos?.[x]).filter(Boolean) as Ability[];
}

function washTags(tags?: number[]) {
  const map = db.atom.get().tagMap;
  if (!tags) {
    return [];
  }
  return tags.filter((x) => !!map[x]);
}

function HistoryCard({
  value,
  index,
  onClick,
}: {
  value: HistoryRecord;
  index: number;
  onClick: (x: { examples: Ability[]; tags: number[] }) => void;
}) {
  const abilities = getAbilities(value.examples);
  const handleDelete = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    deleteHistory(index);
  };

  const handleClick = () => {
    onClick?.({
      examples: abilities,
      tags: washTags(value.tags),
    });
  };

  return (
    <div className={cx('history-card')} onClick={handleClick}>
      <TagsBullet tags={value.tags || []} />
      <AbilityExampleList abilities={abilities || []} />
      <div className={cx('card-actions')}>
        <div className={cx('btn')} onClick={handleDelete}>
          删除
        </div>
      </div>
    </div>
  );
}

function HistoryPannel({ onDestory }: { onDestory: () => void }) {
  const { records } = useAtomView(historyAtom);

  const handleClick = (x: { examples: Ability[]; tags: number[] }) => {
    store.merge({
      examples: x.examples,
      tags: x.tags,
    });
    onDestory();
  };

  useEffect(() => {
    createMemo();
    return () => {
      _memos = undefined;
    };
  }, []);

  return (
    <div className={cx('page-history-pannel')}>
      <div className={cx('header')}>
        <div className={cx('actions')}>
          <div className={cx('btn', 'close')} onClick={onDestory}>
            退出
          </div>
        </div>
      </div>
      <div className={cx('content')}>
        {records.map((record, index) => (
          <HistoryCard key={index} value={record} index={index} onClick={handleClick} />
        ))}
      </div>
    </div>
  );
}

export function showHistory() {
  return Portal.show({
    content: (onDestory) => {
      return <HistoryPannel onDestory={onDestory} />;
    },
  });
}
