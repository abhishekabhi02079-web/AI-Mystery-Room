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

export interface IVerdict {
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
}

export interface ICaseResult {
  caseId: string;
  title: string;
  difficulty: DifficultyLevel;
  status: 'completed';
  verdict: IVerdict;
  solution: {
    explanation: string;
    evidenceReasoning: string[];
  };
  suspects: ISuspect[];
  discoveredClueIds: string[];
  completedAt: string;
}

export interface ICreateCaseResponse {
  success: boolean;
  caseToken: string;
  case: IPublicCase;
}

export interface ICaseDossierResponse {
  success: boolean;
  cases: ICaseDossierEntry[];
}

export interface IGetCaseResponse {
  success: boolean;
  case: IPublicCase;
}

export interface IDiscoverClueResponse {
  success: boolean;
  discoveredClueId: string;
  pointsAwarded: number;
  currentScore: number;
  case: IPublicCase;
}

export interface IRequestHintResponse {
  success: boolean;
  hint: IPublicHint;
  hintsRemaining: number;
  penaltyDeducted: number;
  currentScore: number;
  case: IPublicCase;
}

export interface IAccuseResponse extends ICaseResult {
  success: boolean;
}

export interface IGetResultResponse extends ICaseResult {
  success: boolean;
}

export interface IHealthResponse {
  status: string;
  uptime: number;
  database: 'connected' | 'disconnected';
  timestamp: string;
}

export interface IApiError {
  success: false;
  error?: string;
  message: string;
  details?: Array<{ field: string; message: string }>;
}
