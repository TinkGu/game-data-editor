import { qsParse } from '@tinks/xeno';
import { localStore } from './localstorage';

let __currentTheme = '#fff';
let __githubToken = '';

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

const lsGithubToken = localStore<string>('game-data-editor__githubToken', '');

export function getGithubToken() {
  if (__githubToken) {
    return __githubToken;
  }
  const qsToken = qsParse(window.location.href)?.token;
  if (qsToken) {
    __githubToken = qsToken;
    return qsToken;
  }
  const lsToken = lsGithubToken.get();
  if (lsToken) {
    __githubToken = lsToken;
    return lsToken;
  }
  return '';
}

export function setGithubToken(token: string) {
  lsGithubToken.set(token);
  __githubToken = token;
}
