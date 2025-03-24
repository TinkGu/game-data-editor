let nuidRef = 1;

/** 数字化的伪 uuid，从 0 开始简单地自增，只能在纯前端环境中标志某些资源、对象的唯一性 */
export function nnid() {
  return nuidRef++;
}

/** 先判断为 string 类型再进行 trim 操作 */
export function trim(s: any) {
  if (typeof s === 'string') {
    return s.trim();
  }
  return s;
}

/** 判断 b 字符串中是否包含 a 字符串，且无视大小写 */
export function lowerIncludes(a: any, b: any) {
  if (typeof a !== 'string') {
    return false;
  }

  if (typeof b !== 'string') {
    return false;
  }

  return b.toLowerCase().indexOf(a.toLowerCase()) !== -1;
}
