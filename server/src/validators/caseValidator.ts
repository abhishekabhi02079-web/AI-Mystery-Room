import { z } from 'zod';
import { DifficultyLevel } from '../types/case.types.js';

export const DIFFICULTY_CONFIG: Record<
  DifficultyLevel,
  { suspects: number; clues: number; hints: number; baseScore: number }
> = {
  easy: { suspects: 3, clues: 5, hints: 2, baseScore: 100 },
  medium: { suspects: 4, clues: 7, hints: 3, baseScore: 150 },
  hard: { suspects: 5, clues: 9, hints: 3, baseScore: 200 },
};

// Client request schemas
export const createCaseSchema = z.object({
  premise: z
    .string()
    .trim()
    .min(5, { message: 'Premise must be at least 5 characters long.' })
    .max(500, { message: 'Premise cannot exceed 500 characters.' })
    .optional(),
  difficulty: z.enum(['easy', 'medium', 'hard'], {
    errorMap: () => ({ message: 'Difficulty must be easy, medium, or hard.' }),
  }),
  theme: z.string().trim().max(100).optional(),
});

export const accuseSchema = z.object({
  suspectId: z
    .string()
    .trim()
    .min(1, { message: 'Suspect ID is required for making an accusation.' }),
});

// Gemini structured JSON response schema
export const geminiMysterySchema = z.object({
  title: z.string().min(3).max(150),
  premise: z.string().min(5).max(500),
  story: z.string().min(50).max(3000),
  suspects: z.array(
    z.object({
      id: z.string().min(1),
      name: z.string().min(2),
      description: z.string().min(10),
      motive: z.string().min(5),
      alibi: z.string().min(5),
      occupation: z.string().optional(),
    })
  ),
  clues: z.array(
    z.object({
      id: z.string().min(1),
      title: z.string().min(3),
      description: z.string().min(10),
      category: z.enum(['Physical', 'Document', 'Forensics', 'Witness', 'Digital']),
      significance: z.string().min(5),
    })
  ),
  hints: z.array(
    z.object({
      id: z.string().min(1),
      text: z.string().min(10),
      order: z.number().int().positive(),
    })
  ),
  secretSolution: z.object({
    culpritId: z.string().min(1),
    culpritName: z.string().min(2),
    explanation: z.string().min(30),
    evidenceReasoning: z.array(z.string().min(5)).min(1),
  }),
});

export type GeminiMysteryOutput = z.infer<typeof geminiMysterySchema>;

export interface SemanticValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates logical consistency, entity cross-references, and strict difficulty quotas.
 */
export function validateMysterySemantics(
  mystery: GeminiMysteryOutput,
  difficulty: DifficultyLevel
): SemanticValidationResult {
  const errors: string[] = [];
  const config = DIFFICULTY_CONFIG[difficulty];

  // 1. Difficulty exact count checks
  if (mystery.suspects.length !== config.suspects) {
    errors.push(
      `Expected exactly ${config.suspects} suspects for difficulty '${difficulty}', but received ${mystery.suspects.length}.`
    );
  }
  if (mystery.clues.length !== config.clues) {
    errors.push(
      `Expected exactly ${config.clues} clues for difficulty '${difficulty}', but received ${mystery.clues.length}.`
    );
  }
  if (mystery.hints.length !== config.hints) {
    errors.push(
      `Expected exactly ${config.hints} hints for difficulty '${difficulty}', but received ${mystery.hints.length}.`
    );
  }

  // 2. Identifier uniqueness
  const suspectIds = new Set<string>();
  for (const s of mystery.suspects) {
    if (suspectIds.has(s.id)) {
      errors.push(`Duplicate suspect ID found: '${s.id}'. All suspect IDs must be unique.`);
    }
    suspectIds.add(s.id);
  }

  const clueIds = new Set<string>();
  for (const c of mystery.clues) {
    if (clueIds.has(c.id)) {
      errors.push(`Duplicate clue ID found: '${c.id}'. All clue IDs must be unique.`);
    }
    clueIds.add(c.id);
  }

  const hintIds = new Set<string>();
  for (const h of mystery.hints) {
    if (hintIds.has(h.id)) {
      errors.push(`Duplicate hint ID found: '${h.id}'. All hint IDs must be unique.`);
    }
    hintIds.add(h.id);
  }

  // 3. Culprit referential integrity
  if (!suspectIds.has(mystery.secretSolution.culpritId)) {
    errors.push(
      `Secret solution culpritId '${mystery.secretSolution.culpritId}' is not among the generated suspects [${Array.from(suspectIds).join(', ')}].`
    );
  }

  // 4. Culprit name agreement
  const matchedSuspect = mystery.suspects.find(
    (s) => s.id === mystery.secretSolution.culpritId
  );
  if (matchedSuspect && !mystery.secretSolution.culpritName.toLowerCase().includes(matchedSuspect.name.toLowerCase().split(' ')[0])) {
    // If name is totally divergent
    errors.push(
      `Culprit name '${mystery.secretSolution.culpritName}' does not correspond to suspect '${matchedSuspect.name}'.`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
