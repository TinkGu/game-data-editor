/** 获取两个数组的交集 */
export function getIntersection(a: any[], b: any[]) {
  if (!a.length || !b.length) {
    return [];
  }
  return a.filter((x) => b.indexOf(x) > -1);
}

/** a 完整包含 b */
export function fullIncludes(a: any[], b: any[]) {
  if (!a.length || !b.length) {
    return false;
  }
  for (let x of b) {
    if (!a.includes(x)) {
      return false;
    }
  }
  return true;
}
