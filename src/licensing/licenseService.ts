import { getOrCreateDeviceId } from './deviceIdentity';
import { readLicenseProof, saveLicenseProof } from './licenseStore';
import type { LicenseApi, LicenseProofVerifier, LicenseSnapshot, LicenseStatus } from './types';

function statusFor(proof: LicenseSnapshot['proof'], valid: boolean): LicenseStatus {
  if (!proof) return 'unactivated';
  if (!valid) return 'invalid';
  if (proof.expiresAt && Date.parse(proof.expiresAt) < Date.now()) return 'expired';
  return 'active';
}

export class LicenseService {
  constructor(
    private readonly api: LicenseApi,
    private readonly verifier: LicenseProofVerifier,
    private readonly storage: Storage = localStorage,
  ) {}

  async getSnapshot(): Promise<LicenseSnapshot> {
    const deviceId = getOrCreateDeviceId(this.storage);
    const proof = readLicenseProof(this.storage);
    const valid = proof ? await this.verifier.verify(proof, deviceId) : false;

    return { deviceId, proof, status: statusFor(proof, valid) };
  }

  async activate(serial: string): Promise<LicenseSnapshot> {
    const normalizedSerial = serial.trim().toUpperCase();
    if (!normalizedSerial) throw new Error('Informe o código de ativação.');

    const deviceId = getOrCreateDeviceId(this.storage);
    const proof = await this.api.activate({ serial: normalizedSerial, deviceId });
    const valid = await this.verifier.verify(proof, deviceId);
    if (!valid) throw new Error('Não foi possível validar este código neste dispositivo.');

    saveLicenseProof(proof, this.storage);
    return { deviceId, proof, status: statusFor(proof, valid) };
  }
}

export { statusFor };
