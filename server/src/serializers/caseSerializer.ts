import { ICaseDocument } from '../models/Case.js';
import { IPublicCase, ICaseResult, IPublicClue, IPublicHint } from '../types/case.types.js';
import { calculateProvisionalScore, calculateFinalScore } from '../services/scoringService.js';
import { DIFFICULTY_CONFIG } from '../validators/caseValidator.js';

/**
 * Serializes an active or completed case for safe client consumption.
 * ABSOLUTE SECURITY INVARIANT:
 * - NEVER contains `secretSolution`
 * - NEVER contains `caseTokenHash`
 * - NEVER leaks culprit identity or solution narrative
 */
export function serializePublicCase(caseDoc: ICaseDocument): IPublicCase {
  const discoveredSet = new Set(caseDoc.discoveredClueIds || []);
  const totalClues = caseDoc.clues.length;
  const totalHints = caseDoc.hints.length;
  const hintsRemaining = Math.max(0, totalHints - caseDoc.revealedHintCount);

  // Mask undiscovered clues to provide sealed dossier atmosphere
  const publicClues: IPublicClue[] = caseDoc.clues.map((clue, idx) => {
    const isDiscovered = discoveredSet.has(clue.id);
    return {
      id: clue.id,
      title: isDiscovered ? clue.title : `Classified Evidence #${idx + 1}`,
      description: isDiscovered
        ? clue.description
        : 'This piece of evidence is sealed. Inspect the crime scene to uncover its forensic details.',
      category: clue.category,
      discovered: isDiscovered,
    };
  });

  // Mask unrevealed hints
  const publicHints: IPublicHint[] = caseDoc.hints.map((hint) => {
    const isRevealed = hint.order <= caseDoc.revealedHintCount;
    return {
      id: hint.id,
      order: hint.order,
      text: isRevealed
        ? hint.text
        : `Cryptic Clue #${hint.order} is sealed. Requesting it will deduct points from your final evaluation.`,
      revealed: isRevealed,
    };
  });

  const provisionalScore = calculateProvisionalScore(
    caseDoc.discoveredClueIds.length,
    caseDoc.revealedHintCount
  );

  return {
    caseId: caseDoc.caseId,
    title: caseDoc.title,
    premise: caseDoc.premise,
    difficulty: caseDoc.difficulty,
    theme: caseDoc.theme,
    story: caseDoc.story,
    suspects: caseDoc.suspects.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      motive: s.motive,
      alibi: s.alibi,
      occupation: s.occupation,
    })),
    clues: publicClues,
    hints: publicHints,
    discoveredClueIds: caseDoc.discoveredClueIds,
    revealedHintCount: caseDoc.revealedHintCount,
    totalClues,
    totalHints,
    hintsRemaining,
    provisionalScore,
    status: caseDoc.status,
    createdAt: (caseDoc.createdAt || new Date()).toISOString(),
  };
}

/**
 * Serializes the final verdict and post-case forensic breakdown once status === 'completed'.
 */
export function serializeCompletedCaseResult(caseDoc: ICaseDocument): ICaseResult {
  if (caseDoc.status !== 'completed' || !caseDoc.secretSolution) {
    throw new Error('Cannot serialize completed case result for an active or unpopulated case.');
  }

  const accusedSuspect = caseDoc.suspects.find((s) => s.id === caseDoc.selectedSuspectId);
  const actualCulprit = caseDoc.suspects.find((s) => s.id === caseDoc.secretSolution.culpritId);

  const isCorrect = caseDoc.isCorrect ?? (caseDoc.selectedSuspectId === caseDoc.secretSolution.culpritId);
  const scoreBreakdown = calculateFinalScore(
    caseDoc.difficulty,
    isCorrect,
    caseDoc.discoveredClueIds.length,
    caseDoc.revealedHintCount
  );

  return {
    caseId: caseDoc.caseId,
    title: caseDoc.title,
    difficulty: caseDoc.difficulty,
    status: 'completed',
    verdict: {
      isCorrect,
      accusedSuspectId: caseDoc.selectedSuspectId || 'unknown',
      accusedSuspectName: accusedSuspect ? accusedSuspect.name : 'Unknown Suspect',
      actualCulpritId: caseDoc.secretSolution.culpritId,
      actualCulpritName: actualCulprit ? actualCulprit.name : caseDoc.secretSolution.culpritName,
      baseScore: scoreBreakdown.baseScore,
      clueBonus: scoreBreakdown.clueBonus,
      hintPenalty: scoreBreakdown.hintPenalty,
      finalScore: caseDoc.finalScore ?? scoreBreakdown.finalScore,
      discoveredCluesCount: scoreBreakdown.discoveredCluesCount,
      revealedHintsCount: scoreBreakdown.revealedHintsCount,
    },
    solution: {
      explanation: caseDoc.secretSolution.explanation,
      evidenceReasoning: caseDoc.secretSolution.evidenceReasoning,
    },
    suspects: caseDoc.suspects,
    discoveredClueIds: caseDoc.discoveredClueIds,
    completedAt: (caseDoc.updatedAt || new Date()).toISOString(),
  };
}
