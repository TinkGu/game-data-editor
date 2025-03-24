/**
 * 过滤对象上，值在黑名单列表里的属性
 *
 * ```javascript
 * const obj = filterObjectValues({ a: 1, b: 2, c: 3 }, [1, 3]);
 * // => { b: 2 }
 * ```
 *
 */
export function filterObjectValues(o: Record<string, any>, blackList: any[] = []) {
  if (typeof o !== 'object' || Array.isArray(o) || !o || !blackList?.length) {
    return o;
  }

  const res = {} as Record<string, any>;
  Object.keys(o).forEach((x) => {
    const v = o[x];
    const inBlack = blackList.some((black) => black === v);
    if (inBlack) {
      return;
    }
    res[x] = o[x];
  });
  return res;
}

/**
 * 过滤对象上的空值，即值为 `undefined` | `null` | `''` 的属性 <br/>
 * 若需要过滤其他空值，请使用 `filterObjectValues`
 *
 * ```javascript
 * const o = filterEmptyValues({ a: 0, b: '', c: null, d: undefined });
 * // => { a: 0 }
 * ```
 *
 */
export function filterEmptyValues(o: Record<string, any>) {
  return filterObjectValues(o, ['', null, undefined]);
}

/**
 * 安全地进行 JSON.parse，若失败返回 undefined 而不是 throw err
 */
export function safeJsonParse(...args: Parameters<JSON['parse']>) {
  try {
    return JSON.parse(...args);
  } catch (err) {
    console.error(err);
    return undefined;
  }
}

/**
 * 安全地进行 JSON.parse，若失败返回 '' 而不是 throw err
 */
export function safeJsonStringify(...args: Parameters<JSON['stringify']>) {
  try {
    return JSON.stringify(...args);
  } catch (err) {
    console.error(err);
    return '';
  }
}
