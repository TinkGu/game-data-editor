import { useRef } from 'react';

/**
 * 立即赋值型的 ref 的简写。
 *
 * 相当于 `const ref = useRef(fn); ref.current = fn;`
 *
 * 有助于缓解 effect 依赖数组的警告问题。
 *
 * ```javascript
 * function Demo({ onTimeout }) {
 *   // 如果按照 eslint 警告将 onTimeout 写入依赖数组的话，每次 onTimeout 改变，该 effect 会重复触发
 *   useEffect(() => {
 *    setTimeout(() => {
 *      onTimeout();
 *    }, 2000)
 *   }, [onTimeout]);
 *
 *   // after，effect 不再重复触发了
 *   const onTimeoutRef = useLatest(onTimeout);
 *   useEffect(() => {
 *    setTimeout(() => {
 *      onTimeout.current();
 *    }, 2000)
 *   }, []);
 * }
 * ```
 */
export function useLatest<T>(value: T) {
  const ref = useRef(value);
  ref.current = value;

  return ref;
}
