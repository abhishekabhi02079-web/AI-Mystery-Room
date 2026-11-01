import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HomePage } from '../pages/HomePage.tsx';
import { CreateMysteryPage } from '../pages/CreateMysteryPage.tsx';
import { InvestigationPage } from '../pages/InvestigationPage.tsx';
import { AccusationPage } from '../pages/AccusationPage.tsx';
import { ResultsPage } from '../pages/ResultsPage.tsx';
import { caseApi } from '../services/api.ts';
import { IPublicCase, ICaseResult } from '../types/case.ts';

vi.mock('../services/api.ts', async () => {
  const actual = await vi.importActual<any>('../services/api.ts');
  return {
    ...actual,
    caseApi: {
      checkHealth: vi.fn(),
      createCase: vi.fn(),
      getCase: vi.fn(),
      discoverClue: vi.fn(),
      requestHint: vi.fn(),
      accuseSuspect: vi.fn(),
      getCaseResult: vi.fn(),
    },
    tokenStorage: {
      getToken: vi.fn().mockReturnValue('mock-token-xyz'),
      setToken: vi.fn(),
      removeToken: vi.fn(),
      hasToken: vi.fn().mockReturnValue(true),
    },
  };
});

describe('Full End-to-End Frontend Gameplay Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const generatedCase: IPublicCase = {
    caseId: 'CASE-777888',
    title: 'The Clockmaker’s Coded Chronometer',
    premise: 'A rare mechanical watch vanished from the locked workbench.',
    difficulty: 'medium',
    theme: 'Classic Noir',
    story: 'At midnight, the pendulum ceased swinging and the master chronometer was gone.',
    suspects: [
      {
        id: 'suspect-1',
        name: 'Tobias Finch',
        description: 'Apprentice watchmaker.',
        motive: 'Greed.',
        alibi: 'Polishing gears downstairs.',
      },
      {
        id: 'suspect-2',
        name: 'Lady Beatrice',
        description: 'Customer with debts.',
        motive: 'Owed thousands to collectors.',
        alibi: 'In her carriage outside.',
      },
      {
        id: 'suspect-3',
        name: 'Silas Drake',
        description: 'Rival jeweler.',
        motive: 'Professional jealousy.',
        alibi: 'Drinking tea in the parlour.',
      },
      {
        id: 'suspect-4',
        name: 'Constable Higgins',
        description: 'Off-duty patrolman.',
        motive: 'Gambling losses.',
        alibi: 'Perimeter check.',
      },
    ],
    clues: [
      {
        id: 'clue-1',
        title: 'Sealed Clue #1',
        description: 'This clue is sealed.',
        category: 'Forensics',
        discovered: false,
      },
      {
        id: 'clue-2',
        title: 'Sealed Clue #2',
        description: 'This clue is sealed.',
        category: 'Physical',
        discovered: false,
      },
    ],
    hints: [
      { id: 'hint-1', text: 'Sealed hint 1', order: 1, revealed: false },
      { id: 'hint-2', text: 'Sealed hint 2', order: 2, revealed: false },
      { id: 'hint-3', text: 'Sealed hint 3', order: 3, revealed: false },
    ],
    discoveredClueIds: [],
    revealedHintCount: 0,
    totalClues: 2,
    totalHints: 3,
    hintsRemaining: 3,
    provisionalScore: 0,
    status: 'active',
    createdAt: '2026-10-29T21:00:00.000Z',
  };

  const caseAfterClueDiscovery: IPublicCase = {
    ...generatedCase,
    clues: [
      {
        id: 'clue-1',
        title: 'Brass Shavings on Apron',
        description: 'Fine metallic filings matching the workbench lock.',
        category: 'Forensics',
        discovered: true,
      },
      generatedCase.clues[1],
    ],
    discoveredClueIds: ['clue-1'],
    provisionalScore: 5,
  };

  const caseAfterHint: IPublicCase = {
    ...caseAfterClueDiscovery,
    hints: [
      { id: 'hint-1', text: 'Check whose garments bear metal traces.', order: 1, revealed: true },
      generatedCase.hints[1],
      generatedCase.hints[2],
    ],
    revealedHintCount: 1,
    hintsRemaining: 2,
    provisionalScore: -5,
  };

  const finalCaseResult: ICaseResult = {
    caseId: 'CASE-777888',
    title: 'The Clockmaker’s Coded Chronometer',
    difficulty: 'medium',
    status: 'completed',
    verdict: {
      isCorrect: true,
      accusedSuspectId: 'suspect-1',
      accusedSuspectName: 'Tobias Finch',
      actualCulpritId: 'suspect-1',
      actualCulpritName: 'Tobias Finch',
      baseScore: 150,
      clueBonus: 5,
      hintPenalty: 10,
      finalScore: 145,
      discoveredCluesCount: 1,
      revealedHintsCount: 1,
    },
    solution: {
      explanation: 'Tobias Finch picked the workbench lock using specialized brass tweezers.',
      evidenceReasoning: [
        'Brass shavings on apron prove proximity and tampering with the lock.',
        'Tobias lied about remaining downstairs.',
      ],
    },
    suspects: generatedCase.suspects,
    discoveredClueIds: ['clue-1'],
    completedAt: '2026-10-29T21:20:00.000Z',
  };

  it('progresses seamlessly through creation, investigation, clue discovery, hint unlock, accusation, and results', async () => {
    vi.mocked(caseApi.createCase).mockResolvedValue({
      success: true,
      caseToken: 'tok-777',
      case: generatedCase,
    });
    vi.mocked(caseApi.getCase).mockResolvedValue(generatedCase);
    vi.mocked(caseApi.discoverClue).mockResolvedValue({
      success: true,
      discoveredClueId: 'clue-1',
      pointsAwarded: 5,
      currentScore: 5,
      case: caseAfterClueDiscovery,
    });
    vi.mocked(caseApi.requestHint).mockResolvedValue({
      success: true,
      hint: { id: 'hint-1', text: 'Check whose garments bear metal traces.', order: 1, revealed: true },
      hintsRemaining: 2,
      penaltyDeducted: 10,
      currentScore: -5,
      case: caseAfterHint,
    });
    vi.mocked(caseApi.accuseSuspect).mockResolvedValue({
      success: true,
      ...finalCaseResult,
    });
    vi.mocked(caseApi.getCaseResult).mockResolvedValue(finalCaseResult);

    render(
      <MemoryRouter initialEntries={['/create']}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create" element={<CreateMysteryPage />} />
          <Route path="/case/:caseId" element={<InvestigationPage />} />
          <Route path="/case/:caseId/accuse" element={<AccusationPage />} />
          <Route path="/case/:caseId/result" element={<ResultsPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Step 1: Create Case
    expect(screen.getByRole('heading', { name: /commission a new investigation/i })).toBeInTheDocument();
    const generateBtn = screen.getByRole('button', { name: /generate mystery/i });
    await act(async () => {
      fireEvent.click(generateBtn);
    });

    // Step 2: Arrives at Investigation Room
    await waitFor(() => {
      expect(screen.getByText('The Clockmaker’s Coded Chronometer')).toBeInTheDocument();
    });
    expect(screen.getByText('Tobias Finch')).toBeInTheDocument();
    expect(screen.getByText('Lady Beatrice')).toBeInTheDocument();

    // Step 3: Discover Clue 1
    const examineButtons = screen.getAllByRole('button', { name: /examine/i });
    expect(examineButtons.length).toBeGreaterThan(0);
    await act(async () => {
      fireEvent.click(examineButtons[0]);
    });
    expect(caseApi.discoverClue).toHaveBeenCalledWith('CASE-777888', 'clue-1');

    // Step 4: Request Hint
    const unlockHintBtn = screen.getByRole('button', { name: /unlock hint/i });
    await act(async () => {
      fireEvent.click(unlockHintBtn);
    });
    expect(caseApi.requestHint).toHaveBeenCalledWith('CASE-777888');

    // Step 5: Proceed to Accusation
    const accuseBtn = screen.getByRole('button', { name: /make accusation/i });
    await act(async () => {
      fireEvent.click(accuseBtn);
    });

    // Step 6: On Accusation Screen
    await waitFor(() => {
      expect(screen.getByText('The Accusation Tribunal')).toBeInTheDocument();
    });

    // Select Tobias Finch
    fireEvent.click(screen.getByText('Tobias Finch'));

    // Check confirmation
    const confirmBox = screen.getByText(/I confirm that I have evaluated all evidence/i);
    fireEvent.click(confirmBox);

    // Submit Accusation
    const confirmAccuseBtn = screen.getByRole('button', { name: /confirm accusation/i });
    await act(async () => {
      fireEvent.click(confirmAccuseBtn);
    });
    expect(caseApi.accuseSuspect).toHaveBeenCalledWith('CASE-777888', 'suspect-1');

    // Step 7: On Results Page
    await waitFor(() => {
      expect(screen.getByText(/case solved! culprit captured/i)).toBeInTheDocument();
    });
    expect(screen.getAllByText('Tobias Finch').length).toBeGreaterThan(0);
    expect(screen.getAllByText('145').length).toBe(2);
    expect(screen.getByText(/picked the workbench lock using specialized brass tweezers/i)).toBeInTheDocument();
  });
});
