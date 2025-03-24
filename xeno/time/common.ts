/**
 * setTimeout promisify
 *
 * ```javascript
 * await delay(2000)
 * doSomething()
 * // 相当于
 * setTimeout(() => { doSomething() }, 2000)
 * ```
 */
export function delay(wait: number) {
  return new Promise<number>((resolve) => {
    window.setTimeout(resolve, wait);
  });
}

function padNumber(num: number, fill: number) {
  const len = ('' + num).length;
  return Array(fill > len ? fill - len + 1 || 0 : 0).join('0') + num;
}

/**
 * 将秒数转为 00:31 格式，其中 options
 *
 * - allowZero: 默认不允许，即至少 1 秒，展示为 00:01
 * - floor: 小数处理方式，默认四舍五入，设为 true 时截断小数部分
 *
 * ```javascript
 * const str = formatSec(90.6)
 * // 01:31
 * ```
 */
export const formatSecToMMSS = (rawSeconds: number, options?: { allowZero?: boolean; floor?: boolean }) => {
  const seconds = options?.floor ? Math.floor(rawSeconds) : Math.round(rawSeconds);
  // 防止时间为小数和零
  const roundedSeconds = Math.max(options?.allowZero ? 0 : 1, seconds);
  const minute = Math.floor(roundedSeconds / 60);
  const second = roundedSeconds % 60;

  return `${padNumber(minute, 2)}:${padNumber(second, 2)}`;
};
