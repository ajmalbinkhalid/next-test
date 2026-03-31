export function isBrowser() {
  return typeof window !== "undefined";
}

export function readStorage<T>(key: string): T | null {
  if (!isBrowser()) {
    return null;
  }

  let value: string | null = null;

  try {
    value = window.localStorage.getItem(key);
  } catch {
    return null;
  }

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function writeStorage<T>(key: string, value: T) {
  if (!isBrowser()) {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage failures so auth flows can continue in restricted browsers.
  }
}

export function removeStorage(key: string) {
  if (!isBrowser()) {
    return;
  }

  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore storage failures so logout can still proceed.
  }
}
