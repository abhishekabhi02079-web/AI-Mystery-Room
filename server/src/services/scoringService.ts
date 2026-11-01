import { DifficultyLevel } from '../types/case.types.js';
import { DIFFICULTY_CONFIG } from '../validators/caseValidator.js';

export interface ScoreBreakdown {
  baseScore: number;
  clueBonus: number;
  hintPenalty: number;
  finalScore: number;
  discoveredCluesCount: number;
  revealedHintsCount: number;
}

export const CLUE_BONUS_POINTS = 5;
export const HINT_PENALTY_POINTS = 10;

/**
 * Calculates provisional score during active investigation (without base accusation score).
 */
export function calculateProvisionalScore(
  discoveredCluesCount: number,
  revealedHintsCount: number
): number {
  const clueBonus = discoveredCluesCount * CLUE_BONUS_POINTS;
  const hintPenalty = revealedHintsCount * HINT_PENALTY_POINTS;
  return clueBonus - hintPenalty;
}

/**
 * Calculates final score upon accusation submission.
 * Formula: Final Score = max(0, Base Score + (5 * Unique Clues Discovered) - (10 * Hints Used))
 * If accusation is incorrect, Base Score = 0.
 */
export function calculateFinalScore(
  difficulty: DifficultyLevel,
  isCorrect: boolean,
  uniqueCluesDiscoveredCount: number,
  revealedHintsCount: number
): ScoreBreakdown {
  const baseScore = isCorrect ? DIFFICULTY_CONFIG[difficulty].baseScore : 0;
  const clueBonus = uniqueCluesDiscoveredCount * CLUE_BONUS_POINTS;
  const hintPenalty = revealedHintsCount * HINT_PENALTY_POINTS;

  const rawScore = baseScore + clueBonus - hintPenalty;
  const finalScore = Math.max(0, rawScore);

  return {
    baseScore,
    clueBonus,
    hintPenalty,
    finalScore,
    discoveredCluesCount: uniqueCluesDiscoveredCount,
    revealedHintsCount,
  };
}
