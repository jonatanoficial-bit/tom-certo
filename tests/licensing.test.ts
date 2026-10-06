import { describe, expect, it } from 'vitest';
import { statusFor } from '../src/licensing/licenseService';

const baseProof = {
  version: 1 as const,
  licenseId: 'license-01',
  deviceId: 'device-01',
  product: 'tom-certo' as const,
  issuedAt: '2026-10-06T10:00:00.000Z',
  signature: 'signature',
  payload: 'payload',
};

describe('license status', () => {
  it('requires activation if no local proof exists', () => {
    expect(statusFor(null, false)).toBe('unactivated');
  });

  it('rejects invalid proof', () => {
    expect(statusFor(baseProof, false)).toBe('invalid');
  });

  it('accepts a valid perpetual proof', () => {
    expect(statusFor(baseProof, true)).toBe('active');
  });
});
