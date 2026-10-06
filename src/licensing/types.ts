/**
 * The browser never receives a secret signing key. It only stores a signed
 * entitlement that can be re-checked locally after the first activation.
 */
export interface LicenseProof {
  version: 1;
  licenseId: string;
  deviceId: string;
  product: 'tom-certo';
  issuedAt: string;
  expiresAt?: string;
  signature: string;
  payload: string;
}

export type LicenseStatus = 'unactivated' | 'active' | 'expired' | 'invalid';

export interface LicenseSnapshot {
  deviceId: string;
  proof: LicenseProof | null;
  status: LicenseStatus;
}

export interface LicenseApi {
  activate(input: { serial: string; deviceId: string }): Promise<LicenseProof>;
}

export interface LicenseProofVerifier {
  verify(proof: LicenseProof, deviceId: string): Promise<boolean>;
}
