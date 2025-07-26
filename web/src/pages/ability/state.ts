import { JsonDb } from 'app/utils/json-service';
import { localStore } from 'app/utils/localstorage';
import { Atom } from 'use-atom-view';

export interface Ability {
  id: number;
  name: string;
  desc: string;
  tags: number[];
}

function getStatsModeMemo() {
  try {
    const showStats = window.localStorage.getItem('game-data-editor__showStats');
    return showStats === '1';
  } catch (_) {
    return false;
  }
}

export function setStatsModeMemo(value: boolean) {
  try {
    store.merge({ showStats: value });
    window.localStorage.setItem('game-data-editor__showStats', value ? '1' : '0');
  } catch (_) {}
}

/** 重新统计标签数量 */
export function calcStats() {
  const { items } = db.atom.get();
  let stats = {} as Record<number, number>;
  items.forEach((ab) => {
    ab.tags.forEach((x) => {
      stats[x] = (stats[x] || 0) + 1;
    });
  });
  store.merge({ stats });
}

const lsFilterType = localStore<'some' | 'every'>('game-data-editor__filterType', 'some');

export const db = new JsonDb({
  repo: 'TinkGu/private-cloud',
  path: 'match3/ability',
  atom: Atom.of({
    items: [] as Ability[],
    /** tag 集合， { id, [名字, 颜色, groupId, 描述] }*/
    tagMap: {} as Record<number, [string, string, number, string]>,
    /** 有相同 groupId 的 tag 会单独占据一行显示分类。 { id, [名字] } */
    groupMap: {} as Record<number, [string]>,
  }),
});

export const draftDb = new JsonDb({
  repo: 'TinkGu/private-cloud',
  path: 'match3/drafts',
  atom: Atom.of({
    items: [] as Ability[],
  }),
});

export const store = Atom.of({
  /** 当前圈选的 tags */
  tags: [] as number[],
  /** 展示统计 */
  showStats: getStatsModeMemo(),
  /** 每个标签对应有多少个条目 */
  stats: {} as Record<number, number>,
  /** 标签筛选模式 */
  filterType: lsFilterType.get(),
});

db.subscribe(() => {
  calcStats();
});

store.subscribe((cur, prev) => {
  if (cur.filterType !== prev?.filterType) {
    lsFilterType.set(cur.filterType);
  }
});

export function getTag(tagId: number) {
  return db.atom.get().tagMap[tagId];
}
