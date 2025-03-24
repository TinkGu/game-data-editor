import type { DebounceSettings } from 'lodash';
import debounceFn from 'lodash/debounce';
import throttleFn from 'lodash/throttle';

/**
 * 防抖，使得下一个调用延迟发生。
 *
 * 和 lodash 的区别之处在于，偏向 `immediate` 风格的 api，默认 `{ leading: true, trailing: false }`。即立即发生，随后一段时间内的调用都会被忽略。
 *
 * 文档详见 [lodash.debounce](https://www.lodashjs.com/docs/lodash.debounce)
 *
 * ---
 *
 * debounce 会根据其 leading、trailing 设置做出不同的行为。以下例子以延迟 `3` 秒来描述。
 *
 * - `{ leading: true, trailing: false }` = 首次调用立即执行，但延迟结束前再次调用均不执行。延迟时间内若再次调用，则重新计时。
 *  ```
 *  秒数 = 0 1 2 3 4 5 6 7 8 9
 *  事件 = f f f       f
 *  响应 = o           o
 *  ```
 *
 * - `{ leading: false, trailing: true }` = 延迟指定时间后才被真实调用。延迟时间内若再次调用，则重新计时。lodash 原生行为。
 *  ```
 *  秒数 = 0 1 2 3 4 5 6 7 8 9
 *  事件 = f f f
 *  响应 =             o
 *  ```
 *
 * - `{ leading: true, trailing: true }` = 延迟时间的开始和结束都会执行，延迟时间内若再次调用，则重新计时。
 *
 *  ```
 *  秒数 = 0 1 2 3 4 5 6 7 8 9 10
 *  事件 = f f f       f
 *  响应 = o                   o
 *   ```
 *
 * @param func 函数
 * @param wait 毫秒
 * @param options 选项，默认 `{ leading: true, trailing: false }`
 * @param options.leading 指定在延迟开始前调用，默认为 `true`
 * @param options.trailing 指定在延迟结束后调用，默认为 `false`
 * @param options.maxWait 允许被延迟的最大值
 */
export const debounce = <T extends AnyFunction>(fn: T, wait?: number, options?: DebounceSettings) =>
  debounceFn(fn, wait, { leading: true, trailing: false, ...(options || {}) });

/**
 * lodash.debounce 原生行为，`{ trailing: true }`
 *
 * 延迟指定时间后才被真实调用。延迟时间内若再次调用，则重新计时。
 *
 */
export const rawDebounce = debounceFn;

/** 防抖配置 */
export interface DebounceOptions {
  /** 防抖延迟 */
  wait?: number;
  /**
   * 是否在延迟开始前调用
   * @default false
   */
  leading?: boolean;
  /**
   * 是否在延迟结束后调用
   * @default true
   */
  trailing?: boolean;
  /** 允许被延迟的最大值 */
  maxWait?: number;
}

/**
 * 节流，使得频繁发生的事件，一个时间片内只发生一次。
 *
 * 默认立即触发，并开始计时，时间片内若再次调用，则推迟到时间片结束后调用。
 *
 * 文档详见 [lodash.throttle](https://www.lodashjs.com/docs/lodash.throttle)
 *
 * @param func 函数
 * @param wait 毫秒
 * @param options 选项，默认 `{ leading: true, trailing: true }`
 * @param options.leading 指定在延迟开始前调用，默认为 `true`
 * @param options.trailing 指定在延迟结束后调用，默认为 `true`
 * ---
 *
 * throttle 会根据其 leading、trailing 设置做出不同的行为。以下例子以延迟 `3` 秒来描述。
 *
 */
export const throttle = throttleFn;

/** 节流配置 */
export interface ThrottleOptions {
  /** 节流延迟 */
  wait?: number;
  /**
   * 是否在延迟开始前调用
   * @default true
   */
  leading?: boolean;
  /**
   * 是否在延迟结束后调用
   * @default true
   */
  trailing?: boolean;
}
