import { Atom } from 'use-atom-view';
import { JsonDb } from '../../utils/json-service';

export interface Ability {
  id: number;
  name: string;
  desc: string;
  tags: number[];
  category: string;
}

export const db = new JsonDb({
  repo: 'private-cloud',
  path: 'match3/ability',
  atom: Atom.of({
    items: [] as Ability[],
    /** tag 集合， { id, [名字, 颜色, groupId] }*/
    tagMap: {} as Record<number, [string, string, number]>,
    /** 有相同 groupId 的 tag 会单独占据一行显示分类。 { id, [名字] } */
    groupMap: {} as Record<number, [string]>,
  }),
});

export const store = Atom.of({
  /** 当前圈选的 tags */
  tags: [] as number[],
});
