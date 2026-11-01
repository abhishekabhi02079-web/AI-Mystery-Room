import crypto from 'node:crypto';

/**
 * Generates a cryptographically secure random token (64 hex characters)
 * for anonymous case ownership.
 */
export function generateCaseToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hashes a raw case access token using SHA-256 for secure database storage.
 * @param token Raw unhashed hex token from client
 */
export function hashCaseToken(token: string): string {
  return crypto.createHash('sha256').update(token.trim()).digest('hex');
}

/**
 * Generates a clean human-readable Case ID, e.g. CASE-829103
 */
export function generateCaseId(): string {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `CASE-${randomNum}`;
}
