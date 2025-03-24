/** code from ahooks, see https://github.com/alibaba/hooks/blob/master/packages/hooks/src/useThrottleEffect/index.ts */
import { useEffect, useState } from 'react';
import type { DependencyList, EffectCallback } from 'react';
import type { ThrottleOptions } from '../event/lodash-funcs';
import { useThrottleFn } from './use-throttle-fn';
import { useUpdateEffect } from './use-update-effect';

export function useThrottleEffect(effect: EffectCallback, deps?: DependencyList, options?: ThrottleOptions) {
  const [flag, setFlag] = useState({});

  const throttled = useThrottleFn(
    () => {
      setFlag({});
    },
    options?.wait,
    options,
  );

  useEffect(() => {
    return throttled();
  }, deps);

  // 清除
  useEffect(
    () => () => {
      throttled.cancel();
    },
    [],
  );

  useUpdateEffect(effect, [flag]);
}
