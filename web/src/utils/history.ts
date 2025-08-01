import { Atom } from 'use-atom-view';
import { jsonlocalStore } from './localstorage';

export interface HistoryRecord {
  examples?: number[];
  tags?: number[];
}

export const lsPickHistory = jsonlocalStore<Array<HistoryRecord>>('game-data-editor__pick-history', []);

function checkSame(a: HistoryRecord, b: HistoryRecord) {
  if (a.examples?.length !== b.examples?.length) {
    return false;
  }
  if (a.tags?.length !== b.tags?.length) {
    return false;
  }
  if (a.examples?.length === 0) {
    return true;
  }
  const aTags = a.tags?.join(',');
  const bTags = b.tags?.join(',');
  if (aTags !== bTags) {
    return false;
  }
  const aExamples = a.examples?.join(',');
  const bExamples = b.examples?.join(',');
  return aExamples === bExamples;
}

export const addHistory = (data: HistoryRecord) => {
  const history = lsPickHistory.get();
  // 如果有相同的，提到最顶部
  const sameIdx = history.findIndex((x) => checkSame(x, data));
  if (sameIdx !== -1) {
    history.splice(sameIdx, 1);
    history.unshift(data);
    lsPickHistory.set(history);
    return;
  }
  historyAtom.merge({
    records: [data, ...historyAtom.get().records],
  });
  history.unshift(data);
  lsPickHistory.set(history);
};

export const deleteHistory = (index: number) => {
  const history = lsPickHistory.get();
  history.splice(index, 1);
  lsPickHistory.set(history);
  historyAtom.merge({
    records: [...history],
  });
};

/** 当前相似条目 */
export const historyAtom = Atom.of({
  records: lsPickHistory.get(),
});
