import { createBrowserHistory, History } from 'history';
import { qsEncode } from './url';

let _history: History | null = null;

/** 初始化 history */
export function initBrowserHistory() {
  _history = createBrowserHistory();
}

/** 清除 history 实例 */
export function clearBrowserHistory() {
  _history = null;
}

/** 获取 history 实例 */
export function getHistory(): History {
  if (!_history) {
    initBrowserHistory();
  }
  return _history!;
}

/** 类 query 对象 */
export type QueryObject = Record<string, string | number | undefined | null>;

/** 跳转参数 */
export type NavigateOpts = {
  /** 路由 */
  url: string;
  /** 路由参数，对象，会自动 encode 成 querystring */
  query?: QueryObject;
  /** history method */
  method?: 'push' | 'replace';
  /** 是否在新标签页打开 */
  isNewTab?: boolean;
  /** history state，想清楚再用，别一股脑儿都放这里面当状态管理 */
  state?: Record<string, any>;
};

/**
 * 通用跳转
 * @param options.url
 * @param options.method history method
 * @param options.query query 对象，自动 encode 为字符串
 * @param options.isNewTab 是否在新标签页打开
 * @param options.state history state，想清楚再用，别一股脑儿都放这里面当状态管理
 */
export function navigate({ method = 'push', query, url = '', isNewTab = false, state }: NavigateOpts) {
  const historyMethod = method || 'push';
  const history = getHistory();
  const linkTo = history[historyMethod];

  if (typeof url !== 'string' || !linkTo) {
    return;
  }

  const querystring = typeof query === 'object' ? qsEncode(query) : '';
  let infix = '';
  if (querystring) {
    infix = url.includes('?') ? '&' : '?';
  }
  const finalUrl = `${url}${infix}${querystring}`;
  const currentUrl = `${window.location.pathname}${window.location.search}`;
  // 如果两次跳转页面完全一致，不跳转
  if (!isNewTab && finalUrl === currentUrl) {
    return;
  }
  isNewTab ? window.open(finalUrl) : linkTo(finalUrl, state);
}

/** 返回上一页 */
export function goBack() {
  const history = getHistory();
  history.goBack && history.goBack();
}
