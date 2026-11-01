/**
 * Secure client-side token storage for anonymous case investigation sessions.
 * Tokens are stored exclusively in sessionStorage associated with the case ID
 * and are never exposed in URLs, console logs, or analytics.
 */

const TOKEN_PREFIX = 'case_token_';

export const tokenStorage = {
  getToken(caseId: string): string | null {
    if (!caseId) return null;
    try {
      return sessionStorage.getItem(`${TOKEN_PREFIX}${caseId}`);
    } catch {
      return null;
    }
  },

  setToken(caseId: string, token: string): void {
    if (!caseId || !token) return;
    try {
      sessionStorage.setItem(`${TOKEN_PREFIX}${caseId}`, token);
    } catch (err) {
      console.warn('Session storage write failed:', err);
    }
  },

  removeToken(caseId: string): void {
    if (!caseId) return;
    try {
      sessionStorage.removeItem(`${TOKEN_PREFIX}${caseId}`);
    } catch (err) {
      console.warn('Session storage remove failed:', err);
    }
  },

  hasToken(caseId: string): boolean {
    return Boolean(this.getToken(caseId));
  },
};

