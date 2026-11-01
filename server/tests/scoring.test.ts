import { describe, it, expect } from 'vitest';
import {
  calculateFinalScore,
  calculateProvisionalScore,
  CLUE_BONUS_POINTS,
  HINT_PENALTY_POINTS,
} from '../src/services/scoringService.js';

describe('Scoring Service Unit Tests', () => {
  it('correctly calculates score for Easy difficulty with correct accusation', () => {
    // Easy: base 100, 3 clues (+15), 1 hint (-10) => 100 + 15 - 10 = 105
    const result = calculateFinalScore('easy', true, 3, 1);
    expect(result.baseScore).toBe(100);
    expect(result.clueBonus).toBe(15);
    expect(result.hintPenalty).toBe(10);
    expect(result.finalScore).toBe(105);
  });

  it('correctly calculates score for Medium difficulty with correct accusation', () => {
    // Medium: base 150, 5 clues (+25), 2 hints (-20) => 150 + 25 - 20 = 155
    const result = calculateFinalScore('medium', true, 5, 2);
    expect(result.baseScore).toBe(150);
    expect(result.clueBonus).toBe(25);
    expect(result.hintPenalty).toBe(20);
    expect(result.finalScore).toBe(155);
  });

  it('correctly calculates score for Hard difficulty with correct accusation', () => {
    // Hard: base 200, 7 clues (+35), 0 hints (0) => 200 + 35 = 235
    const result = calculateFinalScore('hard', true, 7, 0);
    expect(result.baseScore).toBe(200);
    expect(result.clueBonus).toBe(35);
    expect(result.hintPenalty).toBe(0);
    expect(result.finalScore).toBe(235);
  });

  it('awards zero base score when accusation is incorrect', () => {
    // Medium: incorrect => base 0, 4 clues (+20), 1 hint (-10) => 0 + 20 - 10 = 10
    const result = calculateFinalScore('medium', false, 4, 1);
    expect(result.baseScore).toBe(0);
    expect(result.clueBonus).toBe(20);
    expect(result.hintPenalty).toBe(10);
    expect(result.finalScore).toBe(10);
  });

  it('enforces a zero minimum floor (never returns negative score)', () => {
    // Incorrect accusation, 0 clues discovered, 3 hints used => 0 + 0 - 30 = -30 => floor 0
    const result = calculateFinalScore('easy', false, 0, 3);
    expect(result.baseScore).toBe(0);
    expect(result.clueBonus).toBe(0);
    expect(result.hintPenalty).toBe(30);
    expect(result.finalScore).toBe(0);
  });

  it('calculates provisional score correctly during active investigation', () => {
    expect(calculateProvisionalScore(2, 0)).toBe(10);
    expect(calculateProvisionalScore(4, 2)).toBe(0);
    expect(calculateProvisionalScore(1, 2)).toBe(-15);
  });
});
