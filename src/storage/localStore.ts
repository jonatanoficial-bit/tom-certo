const STORAGE_PREFIX = 'tom-certo:';

export function saveLocal<T>(key: string, value: T): void {
  localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
}

export function readLocal<T>(key: string): T | null {
  const value = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}
