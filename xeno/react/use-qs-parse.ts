import { useMemo } from 'react';
import { qsParseTyped } from '../url';

/**
 * 获取当前页面的 query 值，并根据传入的参数类型声明自动转型
 *
 * @example
 * ```typescript
 * // http://gitlab.ximalaya.com/xibo-fe/metal-gear?a=1&b=as
 * const { a, b } = useQsParse();
 * a === '1'
 *
 * const { a, b } = useQsParse({ a: 'number' });
 * a === 1
 * ```
 */
export function useQsParse(typeDef?: Record<string, 'number' | 'string'>) {
  // NOTE: 页面的 url schema 一般比较确定，此处强制不监听 typeDef
  return useMemo(() => qsParseTyped(typeDef), []);
}
