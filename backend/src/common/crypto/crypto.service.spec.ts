import { describe, beforeEach, it, expect } from 'vitest';
import { CryptoService } from './crypto.service';

describe('CryptoService', () => {
  let service: CryptoService;

  beforeEach(() => {
    service = new CryptoService();
  });

  describe('isEncrypted', () => {
    it('should return false for plaintext or empty inputs', () => {
      expect(service.isEncrypted('my_plain_password')).toBe(false);
      expect(service.isEncrypted('')).toBe(false);
      expect(service.isEncrypted(null)).toBe(false);
      expect(service.isEncrypted(undefined)).toBe(false);
    });

    it('should return true for envelope-prefixed strings', () => {
      expect(service.isEncrypted('enc:v1:1234:5678:abcd')).toBe(true);
    });
  });

  describe('encrypt and decrypt', () => {
    it('should return empty/null/undefined inputs unchanged', () => {
      expect(service.encrypt(null)).toBeNull();
      expect(service.encrypt(undefined)).toBeUndefined();
      expect(service.encrypt('')).toBe('');

      expect(service.decrypt(null)).toBeNull();
      expect(service.decrypt(undefined)).toBeUndefined();
      expect(service.decrypt('')).toBe('');
    });

    it('should encrypt plaintext into an enc:v1: formatted envelope', () => {
      const secret = 'sk_live_1234567890abcdef';
      const encrypted = service.encrypt(secret);

      expect(encrypted).toBeDefined();
      expect(encrypted).toMatch(/^enc:v1:[0-9a-f]{24}:[0-9a-f]{32}:[0-9a-f]+$/);
    });

    it('should decrypt ciphertext back to the original plaintext', () => {
      const original = 'super-secret-smtp-password-123!';
      const encrypted = service.encrypt(original);
      const decrypted = service.decrypt(encrypted);

      expect(decrypted).toBe(original);
    });

    it('should generate distinct ciphertexts for identical plaintexts (random IV check)', () => {
      const secret = 'same-secret-token';
      const enc1 = service.encrypt(secret);
      const enc2 = service.encrypt(secret);

      expect(enc1).not.toBe(enc2);
      expect(service.decrypt(enc1)).toBe(secret);
      expect(service.decrypt(enc2)).toBe(secret);
    });

    it('should not double-encrypt an already encrypted string', () => {
      const secret = 'my-api-key-999';
      const enc1 = service.encrypt(secret);
      const enc2 = service.encrypt(enc1);

      expect(enc1).toBe(enc2);
    });

    it('should return legacy plaintext unchanged on decrypt()', () => {
      const legacyPlaintext = 'unencrypted_legacy_password';
      expect(service.decrypt(legacyPlaintext)).toBe(legacyPlaintext);
    });

    it('should reject tampered ciphertext with an error (GCM auth tag check)', () => {
      const secret = 'sensitive_data';
      const encrypted = service.encrypt(secret)!;
      // Tamper with the last character
      const tampered = encrypted.slice(0, -1) + (encrypted.endsWith('a') ? 'b' : 'a');

      expect(() => service.decrypt(tampered)).toThrow();
    });
  });
});
