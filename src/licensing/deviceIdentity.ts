const DEVICE_ID_KEY = 'tom-certo:device-id';

/**
 * A browser cannot safely expose a hardware identifier. This UUID is a
 * privacy-respecting installation identifier, persisted until site data is
 * intentionally cleared by the person using the app.
 */
export function getOrCreateDeviceId(storage: Storage = localStorage): string {
  const existing = storage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;

  const deviceId = crypto.randomUUID();
  storage.setItem(DEVICE_ID_KEY, deviceId);
  return deviceId;
}
