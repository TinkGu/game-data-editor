import { delay } from '../time';

/** 重试过程中的运行时数据 */
export interface RetryRuntimeData {
  /** 剩余重试次数 */
  remainTimes: number;
  /** 是否是最后一次 */
  isFinalRetry: boolean;
  retryInterval: number;
  retryTimes: number;
}

/** 重试参数 */
export interface RetryOptions {
  /** 最大重试次数，默认 0，不进行重试；首次执行不消耗重试计数，所以任务最多执行 n+1 次 */
  retryTimes?: number;
  /** 重试间隔，从上一次失败开始算；毫秒值，默认 0，表示立即重试 */
  retryInterval?: number;
  /** 整体执行时间限制，毫秒值，默认 0，表示不限制 */
  timeout?: number;
  /**
   * 【择优模式】当任务成功时，**根据重试条件**，判断当前结果是否接受，若结果不符合预期，请主动 throw err 转为 reject，触发重试。
   *
   * **大部分情况下，你可能不需要使用这个配置字段**。只有当你需要根据重试条件来决定是否继续重试的时候，你才需要配置本方法。
   * 其它场景下，请善用 promise 的能力，继续 `.then`，该抛错误就抛错误，该 catch 就 catch。
   */
  checkResolve?: (res: any, options: RetryRuntimeData) => void;
  /** 【择优模式】多次执行 checkResolve 仍旧 reject 情况下，若存在最近一次成功结果，resolve 这个结果；默认为 false */
  resolveLastResult?: boolean;
}

function getTimeoutMsg(event: any, options?: RetryOptions) {
  const eventName = event?.name || 'event';
  const timeout = Number(options?.timeout) || 0;
  return `[retry] retry '${eventName}' failed: timeout of ${timeout}ms exceeded`;
}

/** 对 promise 或其它事件进行自动重试，成功时自动结束重试 */
export function withRetry<T extends AnyFunction>(event: T, options?: RetryOptions) {
  if (typeof event !== 'function') {
    throw { message: 'retry event must be a function' };
  }

  // 无需重试
  const retryTimes = Number(options?.retryTimes) || 0;
  if (!retryTimes || retryTimes < 0) {
    return event;
  }

  // 考虑到 js 引擎对 timer 的调度，低于 80ms 可以理解为无需延迟
  const MIN_TIMER_WAIT = 80;
  return ((...args: any[]) => {
    return new Promise((rawResolve, rawReject) => {
      const timeout = Number(options?.timeout) || 0;
      const retryInterval = Number(options?.retryInterval) || 0;
      const resolveLastResult = !!options?.resolveLastResult;
      let count = retryTimes + 1;
      let lastErr: any;
      let lastResult: any;
      let timeoutTimer: Timeout;
      let hasTimeout = false;
      let hasLastResult = false;

      function resolve(res: any) {
        // 对 res 进行检查，若 throw error 则继续重试
        const checkResolve = options?.checkResolve;
        if (typeof checkResolve === 'function') {
          const remainTimes = count - 1;
          checkResolve(res, { remainTimes, retryInterval, retryTimes, isFinalRetry: remainTimes === 0 });
        }
        clearTimeout(timeoutTimer);
        rawResolve(res);
      }

      function reject(err: any) {
        // 择优模式下，返回最近的一次成功结果
        if (resolveLastResult && hasLastResult) {
          rawResolve(lastResult);
          return;
        }
        clearTimeout(timeoutTimer);
        rawReject(err);
      }

      const task = async () => {
        while (count > 0) {
          try {
            // TODO: 一直处于 pending 的 promise，会产生内存泄漏问题
            const res = await event(...args);
            lastResult = res;
            hasLastResult = true;
            resolve(res);
            return;
          } catch (err) {
            lastErr = err;
          }

          count--;
          if (count > 0) {
            if (retryInterval > MIN_TIMER_WAIT) {
              await delay(retryInterval);
              if (hasTimeout) {
                return;
              }
            }
          } else {
            reject(lastErr);
            return;
          }
        }
      };

      if (timeout > MIN_TIMER_WAIT) {
        timeoutTimer = setTimeout(() => {
          hasTimeout = true;
          reject({
            message: getTimeoutMsg(event, options),
            lastResult,
            lastErr,
          });
        }, timeout);
      }
      task();
    });
  }) as T;
}
