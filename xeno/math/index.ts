export function toPercent(n: number, percent: number, min = 0) {
  return Math.max(Math.floor((n * percent) / 100), min);
}

/** 计算 sm 约占 big 的百分比几 */
export function getPercent(big: number, sm: number) {
  if (big < 0 || big === 0) {
    return 0;
  }
  return Math.floor((sm / big) * 100);
}
