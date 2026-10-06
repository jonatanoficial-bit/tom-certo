import type { LicenseProof, LicenseProofVerifier } from './types';

function decodeBase64(value: string): ArrayBuffer {
  const bytes = Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
  return bytes.buffer;
}

/**
 * Public-key verification for a future activation API. The public key is safe
 * to ship with the app; the private signing key must exist only on the issuer.
 */
export class WebCryptoProofVerifier implements LicenseProofVerifier {
  constructor(private readonly publicKeyBase64: string) {}

  async verify(proof: LicenseProof, deviceId: string): Promise<boolean> {
    if (proof.deviceId !== deviceId || proof.product !== 'tom-certo') return false;

    try {
      const key = await crypto.subtle.importKey(
        'raw',
        decodeBase64(this.publicKeyBase64),
        { name: 'Ed25519' },
        false,
        ['verify'],
      );
      return crypto.subtle.verify(
        { name: 'Ed25519' },
        key,
        decodeBase64(proof.signature),
        new TextEncoder().encode(proof.payload),
      );
    } catch {
      return false;
    }
  }
}
