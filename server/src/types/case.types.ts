export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type CaseStatus = 'active' | 'completed';
export type ClueCategory = 'Physical' | 'Document' | 'Forensics' | 'Witness' | 'Digital';

export interface ISuspect {
  id: string;
  name: string;
  description: string;
  motive: string;
  alibi: string;
  occupation?: string;
}

export interface IClue {
  id: string;
  title: string;
  description: string;
  category: ClueCategory;
  significance: string;
}

export interface IHint {
  id: string;
  text: string;
  order: number;
}

export interface ISecretSolution {
  culpritId: string;
  culpritName: string;
  explanation: string;
  evidenceReasoning: string[];
}

export interface ICase {
  caseId: string;
  caseTokenHash: string;
  title: string;
  premise: string;
  difficulty: DifficultyLevel;
  theme: string;
  story: string;
  suspects: ISuspect[];
  clues: IClue[];
  hints: IHint[];
  secretSolution: ISecretSolution;
  discoveredClueIds: string[];
  revealedHintCount: number;
  status: CaseStatus;
  selectedSuspectId?: string;
  isCorrect?: boolean;
  finalScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPublicClue {
  id: string;
  title: string;
  description: string;
  category: ClueCategory;
  discovered: boolean;
}

export interface IPublicHint {
  id: string;
  text: string;
  order: number;
  revealed: boolean;
}

export interface IPublicCase {
  caseId: string;
  title: string;
  premise: string;
  difficulty: DifficultyLevel;
  theme: string;
  story: string;
  suspects: ISuspect[];
  clues: IPublicClue[];
  hints: IPublicHint[];
  discoveredClueIds: string[];
  revealedHintCount: number;
  totalClues: number;
  totalHints: number;
  hintsRemaining: number;
  provisionalScore: number;
  status: CaseStatus;
  createdAt: string;
}

export interface ICaseDossierEntry {
  caseId: string;
  title: string;
  difficulty: DifficultyLevel;
  status: CaseStatus;
  createdAt: string;
  updatedAt: string;
  discoveredClueCount: number;
  totalClues: number;
  revealedHintCount: number;
  totalHints: number;
  currentScore: number;
  finalScore: number | null;
  selectedSuspectName: string | null;
  isCorrect: boolean | null;
}

export interface ICaseResult {
  caseId: string;
  title: string;
  difficulty: DifficultyLevel;
  status: 'completed';
  verdict: {
    isCorrect: boolean;
    accusedSuspectId: string;
    accusedSuspectName: string;
    actualCulpritId: string;
    actualCulpritName: string;
    baseScore: number;
    clueBonus: number;
    hintPenalty: number;
    finalScore: number;
    discoveredCluesCount: number;
    revealedHintsCount: number;
  };
  solution: {
    explanation: string;
    evidenceReasoning: string[];
  };
  suspects: ISuspect[];
  discoveredClueIds: string[];
  completedAt: string;
}

export interface ICreateCaseDTO {
  premise?: string;
  difficulty: DifficultyLevel;
  theme?: string;
}

export interface IAccuseDTO {
  suspectId: string;
}
