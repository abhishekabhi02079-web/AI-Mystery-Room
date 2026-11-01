import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';
import { DifficultyLevel } from '../types/case.types.js';
import {
  geminiMysterySchema,
  validateMysterySemantics,
  GeminiMysteryOutput,
  DIFFICULTY_CONFIG,
} from '../validators/caseValidator.js';

let genAIClient: GoogleGenAI | null = null;

function getGenAIClient(): GoogleGenAI | null {
  if (env.NODE_ENV === 'test') {
    return null;
  }

  if (!genAIClient && env.GEMINI_API_KEY) {
    genAIClient = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  }
  return genAIClient;
}

/**
 * Procedural fallback generator when Gemini API key is not configured
 * or for offline test suites. Generates logically coherent, fully solvable cases.
 */
function generateProceduralMystery(
  premise: string,
  difficulty: DifficultyLevel,
  theme: string
): GeminiMysteryOutput {
  const config = DIFFICULTY_CONFIG[difficulty];

  const suspectPool = [
    {
      id: 'suspect-1',
      name: 'Arthur Pendelton',
      description: 'Chief Archivist with 25 years of service, deeply disgruntled over recent budget cuts.',
      motive: 'Threatened with replacement by automated scanning systems and facing impending bankruptcy.',
      alibi: 'Claims he was cataloging rare manuscripts in the basement vault from 9:00 PM to midnight.',
      occupation: 'Archivist',
    },
    {
      id: 'suspect-2',
      name: 'Victoria Sterling',
      description: 'Wealthy private collector and high-profile donor with a reputation for ruthless acquisitions.',
      motive: 'Long desired exclusive possession of the item to complete her personal private gallery.',
      alibi: 'Claims she was dining with the museum trustees at the Grand Vista Hotel across town.',
      occupation: 'Art Collector',
    },
    {
      id: 'suspect-3',
      name: 'Marcus Vance',
      description: 'Night security supervisor who recently purchased an expensive sports car.',
      motive: 'Buried under mounting high-stakes gambling debts with dangerous loan sharks.',
      alibi: 'Maintains he was conducting routine perimeter rounds on the eastern terrace.',
      occupation: 'Head of Security',
    },
    {
      id: 'suspect-4',
      name: 'Dr. Elena Rostova',
      description: 'Lead restoration chemist who discovered the item had a secret valuation far higher than recorded.',
      motive: 'Bitter dispute over intellectual rights to the preservation patent.',
      alibi: 'Stated she was running chemical analysis reagents in the second-floor laboratory.',
      occupation: 'Restoration Chemist',
    },
    {
      id: 'suspect-5',
      name: 'Julian Croft',
      description: 'Ex-magician turned luxury locksmith and security consultant with expert lockpicking skills.',
      motive: 'Wanted to prove that no security system in the world is immune to his technical brilliance.',
      alibi: 'Was seen at the lounge bar until 10:30 PM, after which his whereabouts are unverified.',
      occupation: 'Security Consultant',
    },
  ];

  const cluePool = [
    {
      id: 'clue-1',
      title: 'Deactivated Laser Grid Log',
      description: 'The security log shows the vault alarm grid was disarmed using an authorized supervisor keycard at 10:14 PM.',
      category: 'Digital' as const,
      significance: 'Points directly to an insider with root access to master security overrides.',
    },
    {
      id: 'clue-2',
      title: 'Torn Silk Fiber',
      description: 'A crimson silk thread snagged on the sharp edge of the display pedestal ventilation grate.',
      category: 'Physical' as const,
      significance: 'Matches custom tailored attire worn by one of the suspects during the evening.',
    },
    {
      id: 'clue-3',
      title: 'Smudged Fingerprints on Override Panel',
      description: 'Partial latex glove prints left behind on the internal power kill-switch.',
      category: 'Forensics' as const,
      significance: 'Confirms premeditated equipment was used by the perpetrator.',
    },
    {
      id: 'clue-4',
      title: 'Counterfeit Receipt from Offshore Account',
      description: 'A deposit slip for 250,000 Swiss francs discovered folded inside a leather notebook.',
      category: 'Document' as const,
      significance: 'Proves recent financial desperation and urgent illicit liquidity.',
    },
    {
      id: 'clue-5',
      title: 'Janitor Witness Deposition',
      description: 'The night janitor saw someone matching Marcus Vance near the vault entrance around 10:10 PM.',
      category: 'Witness' as const,
      significance: 'Directly contradicts the claimed terrace perimeter alibi.',
    },
    {
      id: 'clue-6',
      title: 'Corrupted CCTV Timestamp',
      description: 'Ten minutes of camera footage between 10:12 PM and 10:22 PM were looped from a secondary terminal.',
      category: 'Digital' as const,
      significance: 'Requires physical access to the security terminal.',
    },
    {
      id: 'clue-7',
      title: 'Unmarked Keycard Duplicator',
      description: 'A pocket-sized RFID cloner found discarded inside the trash receptacle near the security booth.',
      category: 'Physical' as const,
      significance: 'Explains how the secondary locks were bypassed seamlessly.',
    },
    {
      id: 'clue-8',
      title: 'Chemical Solvent Odor',
      description: 'Faint traces of industrial acetone detected around the glass showcase hinges.',
      category: 'Forensics' as const,
      significance: 'Used to quietly loosen the adhesive seal holding the reinforced glass.',
    },
    {
      id: 'clue-9',
      title: 'Encrypted Text Messages',
      description: 'A burner phone recovered from the rear parking lot with messages confirming: "Package secured, rendezvous at pier 4."',
      category: 'Document' as const,
      significance: 'Corroborates the planned exit route and timeline of the heist.',
    },
  ];

  const hintPool = [
    {
      id: 'hint-1',
      order: 1,
      text: 'Examine who had direct physical access to disable the electronic security grid at the crucial moment.',
    },
    {
      id: 'hint-2',
      order: 2,
      text: 'Cross-reference witness observations against the suspects’ claimed alibis during the 10:00 PM to 10:30 PM window.',
    },
    {
      id: 'hint-3',
      order: 3,
      text: 'Financial distress combined with insider override credentials points to a breach from within the security division.',
    },
  ];

  const selectedSuspects = suspectPool.slice(0, config.suspects);
  const selectedClues = cluePool.slice(0, config.clues);
  const selectedHints = hintPool.slice(0, config.hints);

  // Culprit is Marcus Vance (suspect-3) if present, else suspect-1
  const culprit = selectedSuspects.find((s) => s.id === 'suspect-3') || selectedSuspects[0];

  return {
    title: `The Mystery of ${premise.slice(0, 40).trim() || 'the Vanished Evidence'}`,
    premise,
    story: `On a foggy autumn evening, under the shadow of the grand estate, tranquility was shattered. ${premise} As sirens echoed in the distance, Scotland Yard sealed every exit. The lead inspector gathered the suspects in the gallery. Each holds secrets, but only one is the true perpetrator. As the lead detective, your duty is to examine the clues, dismantle false alibis, and bring the culprit to justice.`,
    suspects: selectedSuspects,
    clues: selectedClues,
    hints: selectedHints,
    secretSolution: {
      culpritId: culprit.id,
      culpritName: culprit.name,
      explanation: `${culprit.name} orchestrated the theft by leveraging internal access to bypass the security grid at 10:14 PM. Facing crippling debt, they disabled the alarm, pocketed the evidence, and staged a looped camera feed before returning to their post, unaware that witness testimony and forensic traces would shatter their alibi.`,
      evidenceReasoning: [
        'The Deactivated Laser Grid Log proves the system was disarmed with supervisor credentials.',
        'The Janitor Witness Deposition directly refutes the perpetrator’s claimed whereabouts.',
        'The Counterfeit Receipt reveals the urgent financial motive behind the crime.',
      ],
    },
  };
}

/**
 * Builds the strict Gemini prompt for generating a solvable detective mystery.
 */
function buildGeminiPrompt(premise: string, difficulty: DifficultyLevel, theme: string): string {
  const config = DIFFICULTY_CONFIG[difficulty];

  return `You are a master detective mystery writer and puzzle game architect.
Generate a complete, logically sound, fair, and solvable fictional mystery case.

CASE PARAMETERS:
- Premise: "${premise}"
- Theme: "${theme}"
- Difficulty: "${difficulty}"

STRICT QUANTITY CONSTRAINTS:
- EXACTLY ${config.suspects} suspects. (IDs: "suspect-1", "suspect-2", etc.)
- EXACTLY ${config.clues} clues. (IDs: "clue-1", "clue-2", etc.)
- EXACTLY ${config.hints} hints. (IDs: "hint-1", "hint-2", etc., with order: 1, 2, ...)
- EXACTLY 1 culprit chosen from the generated suspects.

LOGICAL INTEGRITY RULES:
1. One and only one suspect is the culprit.
2. The mystery must be fair: the clues MUST contain enough logical deduction (such as a broken alibi, physical evidence contradiction, or timeline impossibility) to conclusively prove the culprit's guilt.
3. Innocent suspects should have motives or minor secrets (red herrings), but their innocence must be demonstrable from the clues.
4. Clues must have valid categories: "Physical", "Document", "Forensics", "Witness", or "Digital".
5. Hints must be progressive and helpful without immediately spoiling the culprit's name in hint 1.
6. The secretSolution.culpritId must exactly match the id of the culprit suspect.
7. The secretSolution.culpritName must match the name of the culprit suspect.
8. The secretSolution.explanation must clearly narrate how and why the culprit committed the crime.
9. The secretSolution.evidenceReasoning must list key deductions connecting the clues to the culprit.

RESPONSE FORMAT:
You MUST respond with pure JSON only (no markdown code blocks, no trailing comments). The JSON must match this structure:
{
  "title": "A captivating, atmospheric title",
  "premise": "${premise}",
  "story": "Atmospheric introduction describing the crime scene, time of incident, and setting the stage (150-300 words)",
  "suspects": [
    {
      "id": "suspect-1",
      "name": "Full Name",
      "description": "Background, personality, demeanor",
      "motive": "Plausible reason they might have committed the crime",
      "alibi": "Their stated whereabouts during the crime",
      "occupation": "Profession or social role"
    }
  ],
  "clues": [
    {
      "id": "clue-1",
      "title": "Short Descriptive Title",
      "description": "Detailed observation of the physical evidence, document, or statement",
      "category": "Physical",
      "significance": "How an astute detective can use this in their deduction"
    }
  ],
  "hints": [
    {
      "id": "hint-1",
      "text": "Subtle guiding observation",
      "order": 1
    }
  ],
  "secretSolution": {
    "culpritId": "suspect-1",
    "culpritName": "Full Name",
    "explanation": "Clear explanation of how the crime was executed and why the evidence confirms it",
    "evidenceReasoning": [
      "Point 1 explaining clue significance",
      "Point 2 explaining alibi breakdown"
    ]
  }
}`;
}

/**
 * Generates a validated mystery case using Gemini with automated retries and semantic verification.
 */
export async function generateMysteryCase(
  premise: string,
  difficulty: DifficultyLevel,
  theme: string = 'Classic Noir',
  requestId?: string
): Promise<GeminiMysteryOutput> {
  const cleanPremise = premise.trim() || 'A priceless diamond vanishes from a locked museum vault.';
  const client = getGenAIClient();

  if (!client) {
    console.log('[GEMINI SERVICE] Using high-fidelity procedural generation (no GEMINI_API_KEY).');
    return generateProceduralMystery(cleanPremise, difficulty, theme);
  }

  const prompt = buildGeminiPrompt(cleanPremise, difficulty, theme);
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `[GEMINI SERVICE] Request ${requestId ?? 'unknown'}: requesting generation (attempt ${attempt}/${maxRetries}).`
      );

      const response = await client.models.generateContent({
        model: env.GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
          httpOptions: {
            timeout: 30_000,
            retryOptions: { attempts: 1 },
          },
        },
      });

      const responseText = response.text?.trim() || '';
      if (!responseText) {
        throw new Error('Gemini returned an empty response.');
      }

      // Strip potential markdown code fences if model included them
      let cleanedJson = responseText;
      if (cleanedJson.startsWith('```')) {
        cleanedJson = cleanedJson.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
      }

      const parsedData = JSON.parse(cleanedJson);

      // Validate with Zod
      const validatedData = geminiMysterySchema.parse(parsedData);

      // Perform semantic cross-validation
      const semanticResult = validateMysterySemantics(validatedData, difficulty);
      if (!semanticResult.valid) {
        throw new Error(`Semantic validation failed: ${semanticResult.errors.join('; ')}`);
      }

      console.log(
        `[GEMINI SERVICE] Request ${requestId ?? 'unknown'}: mystery generated and verified on attempt ${attempt}.`
      );
      return validatedData;
    } catch (err: any) {
      console.warn(
        `[GEMINI SERVICE WARNING] Request ${requestId ?? 'unknown'} attempt ${attempt} failed: ${err.message}`
      );
      if (attempt === maxRetries) {
        console.error(
          `[GEMINI SERVICE ERROR] Request ${requestId ?? 'unknown'} exhausted Gemini attempts; using procedural fallback.`
        );
        return generateProceduralMystery(cleanPremise, difficulty, theme);
      }
    }
  }

  return generateProceduralMystery(cleanPremise, difficulty, theme);
}
