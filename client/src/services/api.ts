import axios, { AxiosError } from 'axios';
import {
  ICreateCaseResponse,
  IPublicCase,
  IGetCaseResponse,
  IDiscoverClueResponse,
  IRequestHintResponse,
  IAccuseResponse,
  ICaseResult,
  ICaseDossierResponse,
  IGetResultResponse,
  IHealthResponse,
  DifficultyLevel,
  IApiError,
} from '../types/case.ts';
import { tokenStorage } from '../utils/tokenStorage.ts';

// Default to /api in production (or Vite dev proxy), with configurable env override
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const CASE_CREATION_TIMEOUT_MS = 100_000;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

/**
 * Extracts a human-friendly error message from an API or network error.
 */
export function extractErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as IApiError | undefined;
    if (data?.message) {
      if (data.details && data.details.length > 0) {
        const detailsStr = data.details.map((d) => `${d.field}: ${d.message}`).join(', ');
        return `${data.message} (${detailsStr})`;
      }
      return data.message;
    }
    if (error.response?.status === 404) {
      return 'The requested case file could not be found or has expired.';
    }
    if (error.response?.status === 401) {
      return 'Unauthorized: Your case session token is missing or invalid.';
    }
    if (error.response?.status === 409) {
      return 'Conflict: An accusation has already been rendered for this case.';
    }
    if (error.response?.status === 429) {
      return 'Too many requests. Please wait a short while before generating new cases.';
    }
    if (error.code === 'ECONNABORTED') {
      return 'Request timed out while contacting the detective server. Please try again.';
    }
    if (!error.response && error.message) {
      return `Network connection failed: ${error.message}`;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

export const caseApi = {
  /**
   * Health check
   */
  async checkHealth(): Promise<IHealthResponse> {
    const res = await apiClient.get<IHealthResponse>('/health');
    return res.data;
  },

  /**
   * Retrieve MongoDB-backed active and completed case summaries.
   */
  async getCaseDossier(): Promise<ICaseDossierResponse> {
    const res = await apiClient.get<ICaseDossierResponse>('/cases');
    return res.data;
  },

  /**
   * Generate a new mystery case
   */
  async createCase(
    premise?: string,
    difficulty: DifficultyLevel = 'medium',
    theme?: string
  ): Promise<ICreateCaseResponse> {
    const res = await apiClient.post<ICreateCaseResponse>(
      '/cases',
      {
        premise: premise?.trim() || undefined,
        difficulty,
        theme: theme?.trim() || undefined,
      },
      { timeout: CASE_CREATION_TIMEOUT_MS }
    );

    if (res.data.caseToken && res.data.case?.caseId) {
      tokenStorage.setToken(res.data.case.caseId, res.data.caseToken);
    }

    return res.data;
  },

  /**
   * Retrieve active case state
   */
  async getCase(caseId: string): Promise<IPublicCase> {
    const token = tokenStorage.getToken(caseId);
    const headers = token ? { 'x-case-token': token } : undefined;
    const res = await apiClient.get<IGetCaseResponse>(`/cases/${caseId}`, { headers });
    return res.data.case;
  },

  /**
   * Discover a clue
   */
  async discoverClue(caseId: string, clueId: string): Promise<IDiscoverClueResponse> {
    const token = tokenStorage.getToken(caseId);
    const headers = token ? { 'x-case-token': token } : undefined;
    const res = await apiClient.post<IDiscoverClueResponse>(
      `/cases/${caseId}/clues/${clueId}/discover`,
      {},
      { headers }
    );
    return res.data;
  },

  /**
   * Request a progressive hint
   */
  async requestHint(caseId: string): Promise<IRequestHintResponse> {
    const token = tokenStorage.getToken(caseId);
    const headers = token ? { 'x-case-token': token } : undefined;
    const res = await apiClient.post<IRequestHintResponse>(
      `/cases/${caseId}/hints`,
      {},
      { headers }
    );
    return res.data;
  },

  /**
   * Submit accusation
   */
  async accuseSuspect(caseId: string, suspectId: string): Promise<IAccuseResponse> {
    const token = tokenStorage.getToken(caseId);
    const headers = token ? { 'x-case-token': token } : undefined;
    const res = await apiClient.post<IAccuseResponse>(
      `/cases/${caseId}/accuse`,
      { suspectId },
      { headers }
    );
    return res.data;
  },

  /**
   * Retrieve post-game results
   */
  async getCaseResult(caseId: string): Promise<ICaseResult> {
    const token = tokenStorage.getToken(caseId);
    const headers = token ? { 'x-case-token': token } : undefined;
    const res = await apiClient.get<IGetResultResponse>(`/cases/${caseId}/result`, { headers });
    return res.data;
  },
};

// Backwards-compatible alias for tokenManager
export const tokenManager = tokenStorage;

export default caseApi;
