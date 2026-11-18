import crypto from 'crypto';

/**
 * Advanced Cryptography & Data Protection Module for Chote Store
 * Implements AES-256-GCM authenticated encryption, HMAC-SHA256 hashing,
 * and data masking for sensitive customer and transaction attributes.
 */

const RAW_KEY = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET || 'chote-store-crypto-key-master-2026';
const ENCRYPTION_KEY = crypto.createHash('sha256').update(RAW_KEY).digest();
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits recommended for AES-GCM

/**
 * Encrypts plain text using AES-256-GCM with randomized IV and Authentication Tag.
 * Returns formatted string: "ivHex:authTagHex:encryptedHex"
 */
export function encrypt(plainText: string): string {
  if (!plainText) return '';
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    
    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error);
    return plainText;
  }
}

/**
 * Decrypts AES-256-GCM encrypted string back to UTF-8 plain text.
 * Verifies authenticity with Auth Tag to detect any tampering.
 */
export function decrypt(cipherText: string): string {
  if (!cipherText || !cipherText.includes(':')) return cipherText;
  try {
    const parts = cipherText.split(':');
    if (parts.length !== 3) return cipherText;

    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption error or data tampering detected:', error);
    return cipherText;
  }
}

/**
 * Secure one-way SHA-256 hash with HMAC for indexing or blind searches
 */
export function hmacHash(value: string): string {
  return crypto.createHmac('sha256', ENCRYPTION_KEY).update(value).digest('hex');
}

/**
 * Masks CPF (e.g. "123.456.789-00" -> "***.456.789-**")
 */
export function maskCPF(cpf: string): string {
  if (!cpf) return '';
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return '***.***.***-**';
  return `***.${digits.substring(3, 6)}.${digits.substring(6, 9)}-**`;
}

/**
 * Masks Credit Card Number (e.g. "**** **** **** 1234")
 */
export function maskCreditCard(cardNumber: string): string {
  const digits = (cardNumber || '').replace(/\D/g, '');
  if (digits.length < 4) return '•••• •••• •••• ••••';
  const last4 = digits.substring(digits.length - 4);
  return `•••• •••• •••• ${last4}`;
}

