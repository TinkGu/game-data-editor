/** code from ahooks, see https://github.com/alibaba/hooks/blob/master/packages/hooks/src/useThrottleFn/index.ts */
import { useEffect, useMemo, useRef } from 'react';
import { throttle, ThrottleOptions } from '../event/lodash-funcs';

export function useThrottleFn<T extends AnyFunction>(fn: T, wait = 1000, options?: ThrottleOptions) {
  if (process.env.NODE_ENV === 'development') {
    typeof fn !== 'function' && console.error(`useThrottleFn expected parameter is a function, got ${typeof fn}`);
  }

  const fnRef = useRef(fn);
  fnRef.current = fn;

  const throttled = useMemo(
    () =>
      throttle(
        (...args: Parameters<T>): ReturnType<T> => {
          return fnRef.current(...args);
        },
        wait,
        options,
      ),
    [],
  );

  // 清除
  useEffect(
    () => () => {
      throttled.cancel();
    },
    [],
  );

  return throttled;
}
