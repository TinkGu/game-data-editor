/** code from ahooks, see https://github.com/alibaba/hooks/blob/master/packages/hooks/src/useDebounceEffect/index.ts */
import { useEffect, useState } from 'react';
import type { DependencyList, EffectCallback } from 'react';
import type { DebounceOptions } from '../event/lodash-funcs';
import { useDebounceFn } from './use-debounce-fn';
import { useUpdateEffect } from './use-update-effect';

export function useDebounceEffect(effect: EffectCallback, deps?: DependencyList, options?: DebounceOptions) {
  const [flag, setFlag] = useState({});

  const debounced = useDebounceFn(
    () => {
      setFlag({});
    },
    options?.wait,
    options,
  );

  useEffect(() => {
    return debounced();
  }, deps);

  // 清除防抖
  useEffect(
    () => () => {
      debounced.cancel();
    },
    [],
  );

  useUpdateEffect(effect, [flag]);
}
