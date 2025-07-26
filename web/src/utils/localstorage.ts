export function localStore<T extends string = string>(key: string, defaultValue: T) {
  const get = (): T => {
    try {
      return (window.localStorage.getItem(key) as unknown as T) ?? defaultValue;
    } catch (_) {
      return defaultValue;
    }
  };
  const set = (value: string) => {
    try {
      window.localStorage.setItem(key, value);
    } catch (_) {}
  };
  return { get, set };
}

export function jsonlocalStore<T>(key: string, defaultValue: T) {
  const get = (): T => {
    try {
      const data = window.localStorage.getItem(key);
      if (data) {
        return JSON.parse(data);
      } else {
        return defaultValue;
      }
    } catch (_) {
      return defaultValue;
    }
  };
  const set = (value: T) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (_) {}
  };
  return { get, set };
}
