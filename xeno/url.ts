import qs, { IParseOptions, IStringifyOptions } from 'qs';
import { filterEmptyValues } from './object';

/**
 * 将 querystring 转为结构对象，默认选取当前页面地址进行解析
 *
 * 若需要指定类型，详见 `qsParseTyped`
 *
 * 进一步配置详见：https://github.com/ljharb/qs
 *
 * ```typescript
 * const query = qsParse('https://github.com?a=1&b=2');
 * // { a: '1', b: '2' }
 * ```
 */
export function qsParse(url?: string, options?: IParseOptions) {
  try {
    const href = url || window.location.href;
    if (!href || typeof href !== 'string') {
      return {};
    }
    let query = href;
    const isPureParams = query.indexOf('?') === -1;
    if (!isPureParams) {
      query = href.split('?')[1];
    }
    return qs.parse(query, { ignoreQueryPrefix: true, ...(options || {}) });
  } catch (err) {
    console.error('qs parse error', err);
  }
  return {};
}

/**
 * 根据传入的类型签名，自动为 qsParse 结果转型
 *
 * ```javascript
 * const url = 'https://ximalay.com?a=1&b=as'
 * qsParseTyped({ a: 'number' })
 * // => { a: 1, b: 'as' }
 * ```
 * */
export function qsParseTyped(typeDef?: Record<string, 'number' | 'string'>, url?: string) {
  const query = qsParse(url);
  if (typeDef) {
    Object.keys(typeDef).forEach((k) => {
      if (!(k in query)) {
        return;
      }

      const type = typeDef[k];
      if (type === 'string') {
        console.warn(`qsParse 结果默认是 string，不必特殊指定 ${k}: 'string'`);
      }
      if (type === 'number') {
        query[k] = parseInt(query[k] as unknown as string);
      }
    });
  }
  return query;
}

/**
 * 将对象转为 query 字符串并 encode，默认自动过滤空值 `null`、`undefined`、`''`
 *
 * ```javascript
 * const str = qsEncode({ a: 1, b: 'as', c: '', e: '&' });
 * // => 'a=1&b=as&e=%26'
 * ```
 */
export function qsEncode(data: Record<string, any>, options?: IStringifyOptions) {
  const o = filterEmptyValues(data);
  return qs.stringify(o, { encode: true, skipNulls: true, ...(options || {}) });
}

/**
 * 为当前页面添加或覆盖 querystring
 *
 * ```javascript
 * const url = 'https://github.com?a=1&b=2';
 * const newUrl = qsMerge(url, { c: 3, a: 4 });
 * // => https://github.com?a=4&b=2&c=3
 * ```
 */
export function qsMerge(params: Record<string, any>, url?: string) {
  const _url = url || window.location.href;
  if (typeof _url !== 'string' || !params || typeof params !== 'object') {
    return '';
  }

  try {
    const oldQs = qsParse(_url);
    const newQs = qsEncode({ ...oldQs, ...params });
    const host = _url.split('?')[0];
    return `${host}?${newQs}`;
  } catch (err) {
    console.error('qs merge error', err);
  }
  return _url;
}
