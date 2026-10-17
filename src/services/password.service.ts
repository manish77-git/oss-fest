import bcrypt from 'bcryptjs';

/**
 * Number of salt rounds for bcrypt.
 * 12 rounds provides a strong balance of computational complexity and performance
 * against brute-force and dictionary attacks.
 */
const BCRYPT_SALT_ROUNDS = 12;

/**
 * Hashes a plaintext password using bcrypt with a secure salt.
 * Plaintext passwords are never logged or stored.
 *
 * @param password - The plaintext password to hash
 * @returns A promise resolving to the salted and hashed password string
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

/**
 * Compares a plaintext password against a stored bcrypt hash.
 * Constant-time comparison is used to mitigate timing attacks.
 *
 * @param password - The plaintext password to verify
 * @param hash - The stored password hash
 * @returns A promise resolving to true if passwords match, false otherwise
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
