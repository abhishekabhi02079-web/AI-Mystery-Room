import { describe, it, expect } from 'vitest';
import {
  geminiMysterySchema,
  validateMysterySemantics,
  GeminiMysteryOutput,
} from '../src/validators/caseValidator.js';

describe('Gemini Mystery Validation & Semantic Integrity', () => {
  const validEasyMystery: GeminiMysteryOutput = {
    title: 'The Stolen Emerald',
    premise: 'A rare emerald disappeared from Lord Blackwood’s study.',
    story: 'Lord Blackwood hosted an exclusive dinner when suddenly the lights failed. When power restored, the display case was shattered and the emerald was gone.',
    suspects: [
      {
        id: 'suspect-1',
        name: 'Edgar Croft',
        description: 'Blackwood’s personal secretary with mounting card debts.',
        motive: 'Desperately needed funds before creditors seized his home.',
        alibi: 'Claims he was in the wine cellar retrieving vintage port.',
      },
      {
        id: 'suspect-2',
        name: 'Lady Genevieve',
        description: 'Blackwood’s estranged sister who claimed the gem was her inheritance.',
        motive: 'Felt entitled to the family heirlooms.',
        alibi: 'Claims she was conversing with guests in the drawing room.',
      },
      {
        id: 'suspect-3',
        name: 'Barnaby Finch',
        description: 'The estate gardener who noticed suspicious footsteps earlier.',
        motive: 'Disgruntled over reduced wages and dangerous work conditions.',
        alibi: 'Claims he was locking the greenhouse sheds on the north lawn.',
      },
    ],
    clues: [
      {
        id: 'clue-1',
        title: 'Cellar Key Log',
        description: 'The cellar door was locked from the outside at 9:15 PM.',
        category: 'Document',
        significance: 'Contradicts Edgar Croft’s claimed movements.',
      },
      {
        id: 'clue-2',
        title: 'Glass Fragments',
        description: 'Fine glass shards found in the cuff of a tailored evening jacket.',
        category: 'Physical',
        significance: 'Points to proximity to the shattered display case.',
      },
      {
        id: 'clue-3',
        title: 'Footprints in the Flowerbed',
        description: 'Size 10 leather dress shoes, matching Edgar’s formal footwear.',
        category: 'Forensics',
        significance: 'Places Edgar outside the study window.',
      },
      {
        id: 'clue-4',
        title: 'Maid’s Statement',
        description: 'Heard someone running past the library corridor during the blackout.',
        category: 'Witness',
        significance: 'Corroborates the timeline of escape.',
      },
      {
        id: 'clue-5',
        title: 'Encrypted Ledger',
        description: 'Notes detailing an agreed sale price for a rare stone.',
        category: 'Document',
        significance: 'Shows premeditated planning.',
      },
    ],
    hints: [
      {
        id: 'hint-1',
        text: 'Pay close attention to who had broken glass in their clothing.',
        order: 1,
      },
      {
        id: 'hint-2',
        text: 'Examine whose alibi is conclusively broken by the cellar records.',
        order: 2,
      },
    ],
    secretSolution: {
      culpritId: 'suspect-1',
      culpritName: 'Edgar Croft',
      explanation: 'Edgar Croft exploited the blackout to shatter the display case, pocket the emerald, and flee through the garden.',
      evidenceReasoning: [
        'Cellar key log proves he was not in the cellar.',
        'Glass fragments in his jacket confirm he broke the case.',
      ],
    },
  };

  it('passes validation for a fully compliant Easy mystery', () => {
    const parseResult = geminiMysterySchema.safeParse(validEasyMystery);
    expect(parseResult.success).toBe(true);

    const semanticResult = validateMysterySemantics(validEasyMystery, 'easy');
    expect(semanticResult.valid).toBe(true);
    expect(semanticResult.errors).toHaveLength(0);
  });

  it('rejects mystery when suspect count does not match difficulty', () => {
    // Attempting to validate an Easy mystery (3 suspects) against Medium requirement (4 suspects)
    const semanticResult = validateMysterySemantics(validEasyMystery, 'medium');
    expect(semanticResult.valid).toBe(false);
    expect(semanticResult.errors.some((e) => e.includes('suspects'))).toBe(true);
  });

  it('rejects mystery with duplicate suspect IDs', () => {
    const duplicateSuspects = JSON.parse(JSON.stringify(validEasyMystery));
    duplicateSuspects.suspects[1].id = 'suspect-1'; // Duplicate ID

    const semanticResult = validateMysterySemantics(duplicateSuspects, 'easy');
    expect(semanticResult.valid).toBe(false);
    expect(semanticResult.errors.some((e) => e.includes("Duplicate suspect ID"))).toBe(true);
  });

  it('rejects mystery with duplicate clue IDs', () => {
    const duplicateClues = JSON.parse(JSON.stringify(validEasyMystery));
    duplicateClues.clues[1].id = 'clue-1'; // Duplicate ID

    const semanticResult = validateMysterySemantics(duplicateClues, 'easy');
    expect(semanticResult.valid).toBe(false);
    expect(semanticResult.errors.some((e) => e.includes("Duplicate clue ID"))).toBe(true);
  });

  it('rejects mystery when culpritId is not in the suspects list', () => {
    const invalidCulprit = JSON.parse(JSON.stringify(validEasyMystery));
    invalidCulprit.secretSolution.culpritId = 'ghost-culprit-99';

    const semanticResult = validateMysterySemantics(invalidCulprit, 'easy');
    expect(semanticResult.valid).toBe(false);
    expect(semanticResult.errors.some((e) => e.includes('not among the generated suspects'))).toBe(true);
  });

  it('rejects invalid clue category through Zod schema', () => {
    const invalidCategory = JSON.parse(JSON.stringify(validEasyMystery));
    invalidCategory.clues[0].category = 'SupernaturalMagic'; // Invalid category

    const parseResult = geminiMysterySchema.safeParse(invalidCategory);
    expect(parseResult.success).toBe(false);
  });
});
