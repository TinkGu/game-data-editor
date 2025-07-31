let __currentTheme = '#f6f7f8';

/** 设置状态栏颜色 */
export function setAppTheme(color: string) {
  const meta = document.querySelector('meta[name="theme-color"]');
  const currentColor = meta?.getAttribute('content');
  if (currentColor) {
    __currentTheme = currentColor;
  }
  meta?.setAttribute('content', color);
  return () => {
    meta?.setAttribute('content', __currentTheme);
  };
}
