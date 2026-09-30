import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'node:crypto';

@Injectable()
export class CryptoService {
  private readonly logger = new Logger(CryptoService.name);
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;
  private readonly ENVELOPE_PREFIX = 'enc:v1:';

  constructor() {
    const rawKey =
      process.env.APP_ENCRYPTION_KEY ||
      process.env.ENCRYPTION_KEY ||
      process.env.JWT_SECRET ||
      'bsofts-school-enterprise-encryption-secret-seed-2026';

    // Derive a fixed 32-byte key using SHA-256
    this.key = crypto.createHash('sha256').update(rawKey).digest();
  }

  /**
   * Checks whether a string is encrypted using the envelope format.
   */
  isEncrypted(value?: string | null): boolean {
    if (!value || typeof value !== 'string') return false;
    return value.startsWith(this.ENVELOPE_PREFIX);
  }

  /**
   * Encrypts plaintext using AES-256-GCM with a random IV and authentication tag.
   * If value is already encrypted, returns it unchanged.
   * If value is empty or null/undefined, returns the input safely.
   */
  encrypt(plaintext?: string | null): string | null | undefined {
    if (!plaintext || typeof plaintext !== 'string') return plaintext;
    if (this.isEncrypted(plaintext)) return plaintext;

    try {
      const iv = crypto.randomBytes(12); // Standard 96-bit IV for AES-GCM
      const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
      let encrypted = cipher.update(plaintext, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      const tag = cipher.getAuthTag();

      // Format: enc:v1:<iv_hex>:<tag_hex>:<ciphertext_hex>
      return `${this.ENVELOPE_PREFIX}${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
    } catch (err: any) {
      this.logger.error(`Encryption failure: ${err.message}`);
      throw new Error(`Erreur lors du chiffrement de la donnée: ${err.message}`);
    }
  }

  /**
   * Decrypts ciphertext using AES-256-GCM.
   * If value is not prefixed with envelope, returns it as-is (backward compatible with legacy plaintext).
   */
  decrypt(ciphertext?: string | null): string | null | undefined {
    if (!ciphertext || typeof ciphertext !== 'string') return ciphertext;
    if (!this.isEncrypted(ciphertext)) return ciphertext;

    try {
      const payload = ciphertext.slice(this.ENVELOPE_PREFIX.length);
      const [ivHex, tagHex, encryptedHex] = payload.split(':');

      if (!ivHex || !tagHex || !encryptedHex) {
        throw new Error('Format de charge chiffrée corrompu ou incomplet');
      }

      const iv = Buffer.from(ivHex, 'hex');
      const tag = Buffer.from(tagHex, 'hex');
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      decipher.setAuthTag(tag);

      let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (err: any) {
      this.logger.error(`Decryption failure: ${err.message}`);
      throw new Error(`Erreur lors du déchiffrement de la donnée: ${err.message}`);
    }
  }
}
