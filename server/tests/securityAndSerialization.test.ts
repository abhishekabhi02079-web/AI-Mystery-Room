import { describe, it, expect } from 'vitest';
import { serializePublicCase, serializeCompletedCaseResult } from '../src/serializers/caseSerializer.js';
import { generateCaseToken, hashCaseToken } from '../src/utils/crypto.js';
import { ICaseDocument } from '../src/models/Case.js';

describe('Security & Serialization Tests', () => {
  const mockCaseDoc: any = {
    caseId: 'CASE-771122',
    caseTokenHash: hashCaseToken('secret_token_123'),
    title: 'The Grand Casino Vault Breach',
    premise: 'A million dollars in unmarked casino chips vanished from the vault.',
    difficulty: 'easy',
    theme: 'Classic Noir',
    story: 'At 11:45 PM the vault silent alarm triggered...',
    suspects: [
      { id: 'suspect-1', name: 'Dealer Dan', description: 'Experienced roulette dealer.', motive: 'Debts.', alibi: 'At the wheel.' },
      { id: 'suspect-2', name: 'Manager Morgan', description: 'Floor manager.', motive: 'Fired tomorrow.', alibi: 'In the office.' },
      { id: 'suspect-3', name: 'Security Sam', description: 'Camera monitor.', motive: 'Bribed.', alibi: 'Watching monitors.' },
    ],
    clues: [
      { id: 'clue-1', title: 'Security Footage Loop', description: 'The video feed was spliced at 11:40 PM.', category: 'Digital', significance: 'Insider job.' },
      { id: 'clue-2', title: 'Golden Keycard', description: 'Manager’s master key found in the locker.', category: 'Physical', significance: 'Used to enter.' },
      { id: 'clue-3', title: 'Phone Log', description: 'Call to an offshore bookie.', category: 'Document', significance: 'Motive confirmed.' },
      { id: 'clue-4', title: 'Fingerprint on Vault Handle', description: 'Matched Security Sam.', category: 'Forensics', significance: 'Physical touch.' },
      { id: 'clue-5', title: 'Cocktail Napkin Map', description: 'Map of camera blindspots.', category: 'Document', significance: 'Premeditation.' },
    ],
    hints: [
      { id: 'hint-1', text: 'Examine who manipulated the surveillance monitors.', order: 1 },
      { id: 'hint-2', text: 'Check the fingerprint evidence on the handle.', order: 2 },
    ],
    secretSolution: {
      culpritId: 'suspect-3',
      culpritName: 'Security Sam',
      explanation: 'Security Sam looped the camera feeds and unlocked the vault for his accomplices.',
      evidenceReasoning: [
        'Security footage loop points directly to the monitor station.',
        'Fingerprint on the handle confirms Sam was at the vault door.',
      ],
    },
    discoveredClueIds: ['clue-1'], // Only clue-1 discovered
    revealedHintCount: 1, // Only hint-1 revealed
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('CRITICAL SECURITY GUARANTEE: serializePublicCase NEVER exposes culprit or secret solution', () => {
    const serialized: any = serializePublicCase(mockCaseDoc as ICaseDocument);

    // 1. Solution must not exist anywhere in the public object
    expect(serialized.secretSolution).toBeUndefined();
    expect(serialized.culpritId).toBeUndefined();
    expect(serialized.culpritName).toBeUndefined();
    expect(serialized.explanation).toBeUndefined();
    expect(serialized.evidenceReasoning).toBeUndefined();

    // 2. Token hash must not be exposed
    expect(serialized.caseTokenHash).toBeUndefined();

    // 3. String representation must not contain the culprit's secret solution text
    const serializedJson = JSON.stringify(serialized);
    expect(serializedJson).not.toContain('Security Sam looped the camera feeds');
    expect(serializedJson).not.toContain(mockCaseDoc.caseTokenHash);
  });

  it('masks undiscovered clues while revealing discovered clues', () => {
    const serialized = serializePublicCase(mockCaseDoc as ICaseDocument);

    // clue-1 is discovered
    const clue1 = serialized.clues.find((c) => c.id === 'clue-1');
    expect(clue1?.discovered).toBe(true);
    expect(clue1?.title).toBe('Security Footage Loop');
    expect(clue1?.description).toBe('The video feed was spliced at 11:40 PM.');

    // clue-2 is undiscovered
    const clue2 = serialized.clues.find((c) => c.id === 'clue-2');
    expect(clue2?.discovered).toBe(false);
    expect(clue2?.title).toContain('Classified Evidence');
    expect(clue2?.description).toContain('sealed');
    expect(clue2?.description).not.toContain('Manager’s master key');
  });

  it('masks unrevealed hints while revealing unlocked hints', () => {
    const serialized = serializePublicCase(mockCaseDoc as ICaseDocument);

    // hint-1 is revealed
    const hint1 = serialized.hints.find((h) => h.id === 'hint-1');
    expect(hint1?.revealed).toBe(true);
    expect(hint1?.text).toBe('Examine who manipulated the surveillance monitors.');

    // hint-2 is unrevealed
    const hint2 = serialized.hints.find((h) => h.id === 'hint-2');
    expect(hint2?.revealed).toBe(false);
    expect(hint2?.text).toContain('sealed');
    expect(hint2?.text).not.toContain('Check the fingerprint evidence');
  });

  it('generates 64-character hex tokens and hashes them consistently with SHA-256', () => {
    const token = generateCaseToken();
    expect(token).toHaveLength(64);
    expect(/^[0-9a-f]{64}$/.test(token)).toBe(true);

    const hash1 = hashCaseToken(token);
    const hash2 = hashCaseToken(token);
    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
  });

  it('prevents completed case serialization when case is active', () => {
    expect(() => serializeCompletedCaseResult(mockCaseDoc as ICaseDocument)).toThrow();
  });
});
