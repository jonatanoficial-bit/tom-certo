import type { LicenseProof } from './types';

const LICENSE_PROOF_KEY = 'tom-certo:license-proof';

export function saveLicenseProof(proof: LicenseProof, storage: Storage = localStorage): void {
  storage.setItem(LICENSE_PROOF_KEY, JSON.stringify(proof));
}

export function readLicenseProof(storage: Storage = localStorage): LicenseProof | null {
  const serialized = storage.getItem(LICENSE_PROOF_KEY);
  if (!serialized) return null;

  try {
    return JSON.parse(serialized) as LicenseProof;
  } catch {
    return null;
  }
}
