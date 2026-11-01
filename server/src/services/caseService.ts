import { Case, ICaseDocument } from '../models/Case.js';
import {
  ICreateCaseDTO,
  IAccuseDTO,
  IPublicCase,
  ICaseResult,
  IPublicHint,
  ICaseDossierEntry,
} from '../types/case.types.js';
import { generateMysteryCase } from './geminiService.js';
import { generateCaseToken, hashCaseToken, generateCaseId } from '../utils/crypto.js';
import { serializePublicCase, serializeCompletedCaseResult } from '../serializers/caseSerializer.js';
import { calculateFinalScore, calculateProvisionalScore } from './scoringService.js';

export interface CreateCaseResult {
  caseToken: string;
  case: IPublicCase;
}

export interface DiscoverClueResult {
  discoveredClueId: string;
  pointsAwarded: number;
  currentScore: number;
  case: IPublicCase;
}

export interface RequestHintResult {
  hint: IPublicHint;
  hintsRemaining: number;
  penaltyDeducted: number;
  currentScore: number;
  case: IPublicCase;
}

export class CaseService {
  /**
   * Generates and persists a new mystery case in MongoDB.
   */
  public static async createCase(dto: ICreateCaseDTO, requestId?: string): Promise<CreateCaseResult> {
    const rawToken = generateCaseToken();
    const tokenHash = hashCaseToken(rawToken);
    const caseId = generateCaseId();

    const mysteryData = await generateMysteryCase(
      dto.premise || 'A priceless jewel disappears from an impenetrable vault.',
      dto.difficulty,
      dto.theme || 'Classic Noir',
      requestId
    );
    console.info(`[CASE CREATE] ${requestId ?? caseId} mystery generated; persisting to MongoDB.`);

    const newCase = new Case({
      caseId,
      caseTokenHash: tokenHash,
      title: mysteryData.title,
      premise: mysteryData.premise,
      difficulty: dto.difficulty,
      theme: dto.theme || 'Classic Noir',
      story: mysteryData.story,
      suspects: mysteryData.suspects,
      clues: mysteryData.clues,
      hints: mysteryData.hints,
      secretSolution: mysteryData.secretSolution,
      discoveredClueIds: [],
      revealedHintCount: 0,
      status: 'active',
    });

    await newCase.save();
    console.info(`[CASE CREATE] ${requestId ?? caseId} case ${caseId} saved to MongoDB.`);

    return {
      caseToken: rawToken,
      case: serializePublicCase(newCase),
    };
  }

  /**
   * Retrieves an active or completed case strictly without secret fields.
   */
  public static async getPublicCase(caseId: string): Promise<IPublicCase> {
    const caseDoc = await Case.findOne({ caseId });
    if (!caseDoc) {
      throw { statusCode: 404, message: `Case '${caseId}' not found.` };
    }

    return serializePublicCase(caseDoc);
  }

  /**
   * Lists persisted cases with dossier-safe progress and verdict summaries.
   */
  public static async getCaseDossier(): Promise<ICaseDossierEntry[]> {
    const cases = await Case.find({})
      .select(
        'caseId title difficulty status createdAt updatedAt discoveredClueIds clues revealedHintCount hints selectedSuspectId isCorrect finalScore suspects.id suspects.name'
      )
      .sort({ updatedAt: -1 })
      .lean();

    return cases.map((caseDoc) => {
      const selectedSuspect = caseDoc.suspects.find(
        (suspect) => suspect.id === caseDoc.selectedSuspectId
      );
      const discoveredClueCount = caseDoc.discoveredClueIds.length;

      return {
        caseId: caseDoc.caseId,
        title: caseDoc.title,
        difficulty: caseDoc.difficulty,
        status: caseDoc.status,
        createdAt: caseDoc.createdAt.toISOString(),
        updatedAt: caseDoc.updatedAt.toISOString(),
        discoveredClueCount,
        totalClues: caseDoc.clues.length,
        revealedHintCount: caseDoc.revealedHintCount,
        totalHints: caseDoc.hints.length,
        currentScore:
          caseDoc.status === 'completed'
            ? caseDoc.finalScore ?? 0
            : calculateProvisionalScore(discoveredClueCount, caseDoc.revealedHintCount),
        finalScore: caseDoc.finalScore ?? null,
        selectedSuspectName: selectedSuspect?.name ?? null,
        isCorrect: caseDoc.isCorrect ?? null,
      };
    });
  }

  /**
   * Uncovers a clue idempotently.
   */
  public static async discoverClue(
    caseId: string,
    clueId: string
  ): Promise<DiscoverClueResult> {
    const caseDoc = await Case.findOne({ caseId });
    if (!caseDoc) {
      throw { statusCode: 404, message: `Case '${caseId}' not found.` };
    }

    if (caseDoc.status === 'completed') {
      throw { statusCode: 400, message: 'This investigation is already closed. No further clues can be discovered.' };
    }

    const clueExists = caseDoc.clues.some((c) => c.id === clueId);
    if (!clueExists) {
      throw { statusCode: 404, message: `Clue '${clueId}' does not exist in this case.` };
    }

    const alreadyDiscovered = caseDoc.discoveredClueIds.includes(clueId);
    let pointsAwarded = 0;

    if (!alreadyDiscovered) {
      caseDoc.discoveredClueIds.push(clueId);
      await caseDoc.save();
      pointsAwarded = 5;
    }

    const serialized = serializePublicCase(caseDoc);

    return {
      discoveredClueId: clueId,
      pointsAwarded,
      currentScore: serialized.provisionalScore,
      case: serialized,
    };
  }

  /**
   * Unlocks the next progressive hint.
   */
  public static async requestHint(caseId: string): Promise<RequestHintResult> {
    const caseDoc = await Case.findOne({ caseId });
    if (!caseDoc) {
      throw { statusCode: 404, message: `Case '${caseId}' not found.` };
    }

    if (caseDoc.status === 'completed') {
      throw { statusCode: 400, message: 'This investigation is already closed. No further hints can be requested.' };
    }

    if (caseDoc.revealedHintCount >= caseDoc.hints.length) {
      throw { statusCode: 400, message: 'All available hints for this case have already been deciphered.' };
    }

    caseDoc.revealedHintCount += 1;
    await caseDoc.save();

    const currentHint = caseDoc.hints.find((h) => h.order === caseDoc.revealedHintCount);
    const serialized = serializePublicCase(caseDoc);

    return {
      hint: {
        id: currentHint?.id || `hint-${caseDoc.revealedHintCount}`,
        text: currentHint?.text || '',
        order: caseDoc.revealedHintCount,
        revealed: true,
      },
      hintsRemaining: serialized.hintsRemaining,
      penaltyDeducted: 10,
      currentScore: serialized.provisionalScore,
      case: serialized,
    };
  }

  /**
   * Accuses a suspect, computes the verdict and final score, and permanently seals the case.
   */
  public static async accuseSuspect(
    caseId: string,
    dto: IAccuseDTO
  ): Promise<ICaseResult> {
    // Explicitly select the protected secretSolution
    const caseDoc = await Case.findOne({ caseId }).select('+secretSolution');
    if (!caseDoc) {
      throw { statusCode: 404, message: `Case '${caseId}' not found.` };
    }

    if (caseDoc.status === 'completed') {
      throw {
        statusCode: 409,
        message: 'An accusation has already been rendered for this case. Repeated accusations are not permitted.',
      };
    }

    const suspectExists = caseDoc.suspects.some((s) => s.id === dto.suspectId);
    if (!suspectExists) {
      throw {
        statusCode: 400,
        message: `Suspect '${dto.suspectId}' does not exist in this investigation.`,
      };
    }

    const isCorrect = dto.suspectId === caseDoc.secretSolution.culpritId;
    const scoreBreakdown = calculateFinalScore(
      caseDoc.difficulty,
      isCorrect,
      caseDoc.discoveredClueIds.length,
      caseDoc.revealedHintCount
    );

    caseDoc.status = 'completed';
    caseDoc.selectedSuspectId = dto.suspectId;
    caseDoc.isCorrect = isCorrect;
    caseDoc.finalScore = scoreBreakdown.finalScore;

    await caseDoc.save();

    return serializeCompletedCaseResult(caseDoc);
  }

  /**
   * Retrieves the post-investigation forensic breakdown for a completed case.
   */
  public static async getCaseResult(caseId: string): Promise<ICaseResult> {
    const caseDoc = await Case.findOne({ caseId }).select('+secretSolution');
    if (!caseDoc) {
      throw { statusCode: 404, message: `Case '${caseId}' not found.` };
    }

    if (caseDoc.status !== 'completed') {
      throw {
        statusCode: 403,
        message: 'Investigation is still active. The solution cannot be revealed before an accusation is rendered.',
      };
    }

    return serializeCompletedCaseResult(caseDoc);
  }
}
