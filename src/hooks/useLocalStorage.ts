import { useCallback, useEffect, useState } from "react";

type ValidationResult<T> = {
  valid: boolean;
  value: T;
};

export function useLocalStorage<T>(
  key: string,
  fallbackValue: T,
  validate: (value: unknown) => ValidationResult<T>,
) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return fallbackValue;

    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return fallbackValue;
      const parsed = JSON.parse(raw) as unknown;
      const result = validate(parsed);
      return result.valid ? result.value : fallbackValue;
    } catch (error) {
      console.warn(`Failed to read ${key} from localStorage`, error);
      return fallbackValue;
    }
  });

  const [storageError, setStorageError] = useState<string | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      setStorageError(null);
    } catch (error) {
      console.warn(`Failed to persist ${key}`, error);
      setStorageError("LocalStorage is unavailable or full. Changes may not persist.");
    }
  }, [key, value]);

  const replaceValue = useCallback((next: T | ((current: T) => T)) => {
    setValue((current) => (typeof next === "function" ? (next as (value: T) => T)(current) : next));
  }, []);

  return { value, setValue: replaceValue, storageError };
}
