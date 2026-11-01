import { caseApi, extractErrorMessage } from './api.ts';
import {
  DifficultyLevel,
  ICreateCaseResponse,
  IPublicCase,
  IDiscoverClueResponse,
  IRequestHintResponse,
  IAccuseResponse,
  ICaseResult,
  ICaseDossierResponse,
} from '../types/case.ts';
import { tokenStorage } from '../utils/tokenStorage.ts';

export class CaseClientService {
  /**
   * Fetches saved active and completed cases for the Cases Dossier.
   */
  public static async fetchCaseDossier(): Promise<ICaseDossierResponse> {
    try {
      return await caseApi.getCaseDossier();
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to retrieve saved case dossiers.'));
    }
  }

  /**
   * Generates a new case and stores the access token in session storage
   */
  public static async createMystery(
    premise?: string,
    difficulty: DifficultyLevel = 'medium',
    theme?: string
  ): Promise<ICreateCaseResponse> {
    try {
      return await caseApi.createCase(premise, difficulty, theme);
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to commission mystery case.'));
    }
  }

  /**
   * Fetches active case public state
   */
  public static async fetchCase(caseId: string): Promise<IPublicCase> {
    try {
      return await caseApi.getCase(caseId);
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to retrieve investigation files.'));
    }
  }

  /**
   * Uncovers a clue idempotently
   */
  public static async discoverClue(
    caseId: string,
    clueId: string
  ): Promise<IDiscoverClueResponse> {
    try {
      return await caseApi.discoverClue(caseId, clueId);
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to examine crime scene evidence.'));
    }
  }

  /**
   * Unlocks the next progressive hint
   */
  public static async unlockHint(caseId: string): Promise<IRequestHintResponse> {
    try {
      return await caseApi.requestHint(caseId);
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to decipher cryptic hint.'));
    }
  }

  /**
   * Renders the final accusation
   */
  public static async accuse(
    caseId: string,
    suspectId: string
  ): Promise<IAccuseResponse> {
    try {
      return await caseApi.accuseSuspect(caseId, suspectId);
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to submit final accusation.'));
    }
  }

  /**
   * Retrieves final case verdict and solution narrative
   */
  public static async fetchResult(caseId: string): Promise<ICaseResult> {
    try {
      return await caseApi.getCaseResult(caseId);
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to unseal case resolution.'));
    }
  }

  /**
   * Checks if a case token exists for the given caseId
   */
  public static hasSessionToken(caseId: string): boolean {
    return tokenStorage.hasToken(caseId);
  }

  /**
   * Clears the session token for the given caseId
   */
  public static clearSession(caseId: string): void {
    tokenStorage.removeToken(caseId);
  }
}

export default CaseClientService;
