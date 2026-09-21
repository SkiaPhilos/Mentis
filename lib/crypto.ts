import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Standard 96-bit IV for GCM
const AUTH_TAG_LENGTH = 16; // 128-bit auth tag

/**
 * Derives a 32-byte (256-bit) encryption key from the environment variable or server seed.
 */
function getEncryptionKey(): Buffer {
  const envKey = process.env.AI_CREDENTIAL_ENCRYPTION_KEY?.trim();

  if (envKey) {
    // If it's a 64-char hex string (32 bytes)
    if (/^[0-9a-fA-F]{64}$/.test(envKey)) {
      return Buffer.from(envKey, 'hex');
    }
    // If it's raw text, hash it with SHA-256 to ensure exact 32 bytes
    return crypto.createHash('sha256').update(envKey).digest();
  }

  // Deterministic fallback server seed based on system identity
  const fallbackSeed = process.env.SUPABASE_SERVICE_ROLE_KEY || 'mentis-scholarly-vault-sanctuary-seed-2026';
  return crypto.createHash('sha256').update(fallbackSeed).digest();
}

/**
 * Encrypts a sensitive string (e.g. Gemini / OpenAI / Anthropic API Key) using AES-256-GCM.
 * Output format: <iv_hex>:<authTag_hex>:<ciphertext_hex>
 */
export function encryptCredential(plaintext: string): string {
  if (!plaintext || typeof plaintext !== 'string') {
    throw new Error('Invalid plaintext credential provided for encryption');
  }

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts an AES-256-GCM encrypted payload back into plaintext.
 */
export function decryptCredential(ciphertextPayload: string): string {
  if (!ciphertextPayload || typeof ciphertextPayload !== 'string') {
    throw new Error('Invalid ciphertext credential provided for decryption');
  }

  const parts = ciphertextPayload.split(':');
  if (parts.length !== 3) {
    throw new Error('Malformed ciphertext payload structure');
  }

  const [ivHex, authTagHex, encryptedHex] = parts;
  const key = getEncryptionKey();
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Masks an API key for secure presentation in the client UI (e.g., '••••••••••••4F92').
 */
export function maskApiKey(key: string): string {
  if (!key) return '';
  const trimmed = key.trim();
  if (trimmed.length <= 6) {
    return '••••••••';
  }
  const lastFour = trimmed.slice(-4);
  return `••••••••••••${lastFour}`;
}
