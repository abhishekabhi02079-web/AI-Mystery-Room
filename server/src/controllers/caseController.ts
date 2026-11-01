import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';
import { CaseService } from '../services/caseService.js';
import { createCaseSchema, accuseSchema } from '../validators/caseValidator.js';

export class CaseController {
  /**
   * GET /api/cases
   * Lists persisted active and completed case summaries for the Cases Dossier.
   */
  public static async getCaseDossier(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cases = await CaseService.getCaseDossier();

      res.status(200).json({
        success: true,
        cases,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/cases
   * Generates a new mystery using Gemini or procedural engine and returns public case + access token.
   */
  public static async createCase(req: Request, res: Response, next: NextFunction): Promise<void> {
    const requestId = randomUUID();
    const startedAt = Date.now();
    console.info(`[CASE CREATE] Request ${requestId} started.`);
    res.on('finish', () => {
      console.info(
        `[CASE CREATE] Request ${requestId} responded with ${res.statusCode} in ${Date.now() - startedAt}ms.`
      );
    });
    res.on('close', () => {
      if (!res.writableEnded) {
        console.warn(
          `[CASE CREATE] Request ${requestId} connection closed before a response after ${Date.now() - startedAt}ms.`
        );
      }
    });

    try {
      const validatedData = createCaseSchema.parse(req.body);
      const result = await CaseService.createCase(validatedData, requestId);

      res.status(201).json({
        success: true,
        caseToken: result.caseToken,
        case: result.case,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/cases/:id
   * Retrieves public case state (sealed clues and hints preserved, secret solution never revealed).
   */
  public static async getCase(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const publicCase = await CaseService.getPublicCase(id);

      res.status(200).json({
        success: true,
        case: publicCase,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/cases/:id/clues/:clueId/discover
   * Uncovers a clue idempotently and updates provisional score.
   */
  public static async discoverClue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, clueId } = req.params;
      const result = await CaseService.discoverClue(id, clueId);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/cases/:id/hints
   * Unlocks the next progressive hint and records hint penalty.
   */
  public static async requestHint(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await CaseService.requestHint(id);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/cases/:id/accuse
   * Submits accusation, resolves culprit comparison, locks case, calculates score, and reveals resolution.
   */
  public static async accuseSuspect(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = accuseSchema.parse(req.body);
      const result = await CaseService.accuseSuspect(id, validatedData);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/cases/:id/result
   * Retrieves post-game forensic breakdown for completed cases.
   */
  public static async getCaseResult(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await CaseService.getCaseResult(id);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
}
