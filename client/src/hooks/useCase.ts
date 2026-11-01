import { useState, useEffect, useCallback } from 'react';
import { IPublicCase, IAccuseResponse } from '../types/case.ts';
import { CaseClientService } from '../services/caseService.ts';
import { tokenStorage } from '../utils/tokenStorage.ts';

export interface UseCaseReturn {
  currentCase: IPublicCase | null;
  isLoading: boolean;
  isActionLoading: boolean;
  error: string | null;
  hasToken: boolean;
  loadCase: () => Promise<void>;
  discoverClue: (clueId: string) => Promise<boolean>;
  requestHint: () => Promise<boolean>;
  accuseSuspect: (suspectId: string) => Promise<IAccuseResponse | null>;
  clearError: () => void;
  setCurrentCase: React.Dispatch<React.SetStateAction<IPublicCase | null>>;
}

export function useCase(caseId: string | undefined): UseCaseReturn {
  const [currentCase, setCurrentCase] = useState<IPublicCase | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const hasToken = caseId ? tokenStorage.hasToken(caseId) : false;

  const loadCase = useCallback(async () => {
    if (!caseId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await CaseClientService.fetchCase(caseId);
      setCurrentCase(data);
    } catch (err: any) {
      setError(err.message || 'Could not load case data.');
    } finally {
      setIsLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    loadCase();
  }, [loadCase]);

  const discoverClue = useCallback(
    async (clueId: string): Promise<boolean> => {
      if (!caseId || isActionLoading) return false;
      setIsActionLoading(true);
      setError(null);

      try {
        const response = await CaseClientService.discoverClue(caseId, clueId);
        if (response.success && response.case) {
          setCurrentCase(response.case);
          return true;
        }
        return false;
      } catch (err: any) {
        setError(err.message || 'Failed to examine evidence.');
        return false;
      } finally {
        setIsActionLoading(false);
      }
    },
    [caseId, isActionLoading]
  );

  const requestHint = useCallback(async (): Promise<boolean> => {
    if (!caseId || isActionLoading) return false;
    setIsActionLoading(true);
    setError(null);

    try {
      const response = await CaseClientService.unlockHint(caseId);
      if (response.success && response.case) {
        setCurrentCase(response.case);
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.message || 'Failed to unlock hint.');
      return false;
    } finally {
      setIsActionLoading(false);
    }
  }, [caseId, isActionLoading]);

  const accuseSuspect = useCallback(
    async (suspectId: string): Promise<IAccuseResponse | null> => {
      if (!caseId || isActionLoading) return null;
      setIsActionLoading(true);
      setError(null);

      try {
        const response = await CaseClientService.accuse(caseId, suspectId);
        return response;
      } catch (err: any) {
        setError(err.message || 'Failed to submit accusation.');
        return null;
      } finally {
        setIsActionLoading(false);
      }
    },
    [caseId, isActionLoading]
  );

  const clearError = useCallback(() => setError(null), []);

  return {
    currentCase,
    isLoading,
    isActionLoading,
    error,
    hasToken,
    loadCase,
    discoverClue,
    requestHint,
    accuseSuspect,
    clearError,
    setCurrentCase,
  };
}

