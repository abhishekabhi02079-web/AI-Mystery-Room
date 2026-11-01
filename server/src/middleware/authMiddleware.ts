import { Request, Response, NextFunction } from 'express';
import { Case } from '../models/Case.js';
import { hashCaseToken } from '../utils/crypto.js';

export interface AuthenticatedRequest extends Request {
  caseDoc?: any;
}

/**
 * Middleware ensuring that the caller possesses the secret case access token
 * issued at case generation. Protects against case tampering and ID spoofing.
 */
export async function requireCaseAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const caseId = req.params.id;
  const rawToken = req.headers['x-case-token'] as string | undefined;

  if (!rawToken) {
    res.status(401).json({
      success: false,
      error: 'Missing Authorization Token',
      message: 'Access denied: x-case-token header is required for case operations.',
    });
    return;
  }

  try {
    const hashed = hashCaseToken(rawToken);
    const caseDoc = await Case.findOne({ caseId }).select('+caseTokenHash');

    if (!caseDoc) {
      res.status(404).json({
        success: false,
        error: 'Case Not Found',
        message: `Investigation case '${caseId}' could not be located.`,
      });
      return;
    }

    if (caseDoc.caseTokenHash !== hashed) {
      res.status(401).json({
        success: false,
        error: 'Invalid Case Token',
        message: 'The provided access token does not match the case records.',
      });
      return;
    }

    // Attach case to request for downstream optimization
    req.caseDoc = caseDoc;
    next();
  } catch (error) {
    next(error);
  }
}
