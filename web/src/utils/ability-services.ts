import { trim } from '@tinks/xeno';
import { Ability } from 'app/pages/ability/state';
import { Atom } from 'use-atom-view';

let tagsCache = new Map<number, Set<number>>();
let nameCache = new Map<number, Set<string>>();

function getMemoName(a: Ability) {
  if (nameCache.has(a.id)) {
    return nameCache.get(a.id);
  }
  const cache = new Set<string>();
  a.name.split('').forEach((word) => {
    cache.add(word);
  });
  nameCache.set(a.id, cache);
  return cache;
}
function getMemoTags(a: Ability) {
  if (tagsCache.has(a.id)) {
    return tagsCache.get(a.id);
  }
  const cache = new Set<number>();
  a.tags.forEach((tag) => {
    cache.add(tag);
  });
  tagsCache.set(a.id, cache);
  return cache;
}

// 判断 a, b 两个技能相似度，返回相似度百分比
// 1. 判断技能名称是否相似
// 1.1 a.name 完全等于 b.name，+100 分
// 1.2 a.name 中包含 b.name 的字符，每包含一个字符，+10 分
// 2. 判断技能描述是否相似
// 3. 判断技能标签是否相似
// 3.1 a.tags 数组完全等于 b.tags，+100 分
// 3.2 a.tags 数组中包含 b.tags 的元素，每包含一个元素，+10 分，发现不同的元素，-10 分
export function isAbilitySimilar(a: Ability, b: Ability) {
  let score = 0;
  if (a.name && b.name) {
    let nameScore = 0;
    if (a.name === b.name) {
      nameScore = 100;
    } else {
      const as = getMemoName(a);
      const bs = getMemoName(b);
      if (as && bs) {
        for (const w of as) {
          if (bs.has(w)) {
            nameScore += 10;
          }
        }
        if (nameScore === as.size * 10) {
          nameScore = 100;
        }
      }
    }
    score += nameScore;
  }

  if (a.desc && b.desc && a.desc === b.desc) {
    score += 100;
  }

  if (a.tags.length && b.tags.length) {
    const aTags = getMemoTags(a);
    const bTags = getMemoTags(b);
    if (aTags && bTags) {
      let tagScore = 0;
      for (const t of aTags) {
        tagScore += bTags.has(t) ? 10 : -10;
      }
      if (aTags.size === bTags.size && tagScore === aTags.size * 10) {
        tagScore = 100;
      }
      score += tagScore;
    }
  }

  return score;
}

function clearCache(id: number) {
  tagsCache.delete(id);
  nameCache.delete(id);
}

export function findSimilarAbilities(a: Ability, abilities: Ability[]) {
  const res = [] as Array<[Ability, number]>;
  clearCache(a.id);
  for (const b of abilities) {
    const score = isAbilitySimilar(a, b);
    if (score > 70) {
      res.push([b, score]);
    }
  }
  res.sort((a, b) => b[1] - a[1]);
  return res;
}

/** 当前相似条目 */
export const samesAtom = Atom.of({
  base: undefined as Ability | undefined,
  sames: [] as Array<[Ability, number]>,
});

export function clearSames() {
  samesAtom.merge({
    base: undefined,
    sames: [],
  });
}

export function searchSames(ability: Ability, list: Ability[]) {
  const base = {
    id: ability.id || -1,
    name: trim(ability.name) || '',
    desc: trim(ability.desc) || '',
    tags: ability.tags || [],
  };
  const sames = findSimilarAbilities(
    base,
    list.filter((x) => x.id !== base?.id),
  );
  samesAtom.merge({ base, sames });
  return sames;
}
