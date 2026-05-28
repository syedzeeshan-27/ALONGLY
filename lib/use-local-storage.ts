"use client";

import { useCallback, useSyncExternalStore } from "react";

type Subscriber = () => void;

const subscribers = new Map<string, Set<Subscriber>>();
const snapshotCache = new Map<string, { raw: string | null; value: unknown }>();

function notify(key: string) {
  snapshotCache.delete(key);
  subscribers.get(key)?.forEach((callback) => callback());
}

function subscribe(key: string, callback: Subscriber) {
  let set = subscribers.get(key);
  if (!set) {
    set = new Set();
    subscribers.set(key, set);
  }
  set.add(callback);

  const handleStorage = (event: StorageEvent) => {
    if (event.key === key) {
      snapshotCache.delete(key);
      callback();
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener("storage", handleStorage);
  }

  return () => {
    set?.delete(callback);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", handleStorage);
    }
  };
}

function readSnapshot<T>(
  key: string,
  parse: (raw: string | null) => T,
): T {
  const raw = window.localStorage.getItem(key);
  const cached = snapshotCache.get(key);
  if (cached && cached.raw === raw) {
    return cached.value as T;
  }
  const value = parse(raw);
  snapshotCache.set(key, { raw, value });
  return value;
}

export function useLocalStorage<T>(
  key: string,
  parse: (raw: string | null) => T,
  serverFallback: T,
) {
  const getSnapshot = useCallback(() => {
    if (typeof window === "undefined") {
      return serverFallback;
    }
    return readSnapshot(key, parse);
  }, [key, parse, serverFallback]);

  const getServerSnapshot = useCallback(() => serverFallback, [serverFallback]);

  const subscribeKey = useCallback(
    (callback: Subscriber) => subscribe(key, callback),
    [key],
  );

  const value = useSyncExternalStore(subscribeKey, getSnapshot, getServerSnapshot);

  const setValue = useCallback(
    (raw: string | null) => {
      if (typeof window === "undefined") return;
      if (raw === null) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, raw);
      }
      notify(key);
    },
    [key],
  );

  return [value, setValue] as const;
}
