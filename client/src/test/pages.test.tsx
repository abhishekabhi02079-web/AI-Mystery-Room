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

// Mock caseApi methods
vi.mock('../services/api.ts', async () => {
  const actual = await vi.importActual<any>('../services/api.ts');
  return {
    ...actual,
    caseApi: {
      checkHealth: vi.fn(),
      createCase: vi.fn(),
      getCaseDossier: vi.fn(),
      getCase: vi.fn(),
      discoverClue: vi.fn(),
      requestHint: vi.fn(),
      accuseSuspect: vi.fn(),
      getCaseResult: vi.fn(),
    },
    tokenStorage: {
      getToken: vi.fn().mockReturnValue('mock-token-123'),
      setToken: vi.fn(),
      removeToken: vi.fn(),
      hasToken: vi.fn().mockReturnValue(true),
    },
  };
});

const mockPublicCase: IPublicCase = {
  caseId: 'CASE-123456',
  title: 'The Diamond Gallery Disappearance',
  premise: 'A priceless diamond disappeared during a grand gala.',
  difficulty: 'easy',
  theme: 'Classic Noir',
  story: 'At 10:15 PM, alarms blared across the east wing of the gallery.',
  suspects: [
    {
      id: 'suspect-1',
      name: 'Julian Vance',
      description: 'The curator with secret debts.',
      motive: 'Mounting offshore debt.',
      alibi: 'Giving opening speech.',
      occupation: 'Curator',
    },
    {
      id: 'suspect-2',
      name: 'Clara Sterling',
      description: 'Wealthy collector.',
      motive: 'Covets the stone.',
      alibi: 'In the garden terrace.',
      occupation: 'Collector',
    },
    {
      id: 'suspect-3',
      name: 'Marcus Bell',
      description: 'Night watchman.',
      motive: 'Threatened by smugglers.',
      alibi: 'At the security monitor desk.',
      occupation: 'Guard',
    },
  ],
  clues: [
    {
      id: 'clue-1',
      title: 'Bypassed Keypad',
      description: 'Master keycode override was entered at 10:14 PM.',
      category: 'Digital',
      discovered: true,
    },
    {
      id: 'clue-2',
      title: 'Classified Evidence #2',
      description: 'This piece of evidence is sealed.',
      category: 'Forensics',
      discovered: false,
    },
    {
      id: 'clue-3',
      title: 'Classified Evidence #3',
      description: 'This piece of evidence is sealed.',
      category: 'Physical',
      discovered: false,
    },
  ],
  hints: [
    { id: 'hint-1', text: 'Examine who had administrative override access.', order: 1, revealed: true },
    { id: 'hint-2', text: 'Sealed hint', order: 2, revealed: false },
  ],
  discoveredClueIds: ['clue-1'],
  revealedHintCount: 1,
  totalClues: 3,
  totalHints: 2,
  hintsRemaining: 1,
  provisionalScore: -5,
  status: 'active',
  createdAt: '2026-10-29T20:00:00.000Z',
};

const mockCompletedResult: ICaseResult = {
  caseId: 'CASE-123456',
  title: 'The Diamond Gallery Disappearance',
  difficulty: 'easy',
  status: 'completed',
  verdict: {
    isCorrect: true,
    accusedSuspectId: 'suspect-1',
    accusedSuspectName: 'Julian Vance',
    actualCulpritId: 'suspect-1',
    actualCulpritName: 'Julian Vance',
    baseScore: 100,
    clueBonus: 5,
    hintPenalty: 10,
    finalScore: 95,
    discoveredCluesCount: 1,
    revealedHintsCount: 1,
  },
  solution: {
    explanation: 'Julian Vance used his curator override to disable the alarm and pocket the diamond.',
    evidenceReasoning: [
      'Digital keypad override proves high-level administrative clearance.',
      'Julian had sole access to the master keycode.',
    ],
  },
  suspects: mockPublicCase.suspects,
  discoveredClueIds: ['clue-1'],
  completedAt: '2026-10-29T20:30:00.000Z',
};

describe('Frontend Page Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(caseApi.getCaseDossier).mockResolvedValue({ success: true, cases: [] });
  });

  // 1. Home Page
  describe('HomePage', () => {
    it('renders the home page and dossier empty state', async () => {
      render(
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      );

      // Hero heading
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Every Mystery Has a Secret/i);

      // Action buttons
      expect(screen.getByRole('link', { name: /start investigating/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /how to play/i })).toBeInTheDocument();

      // Three feature pillars
      expect(screen.getByText('Investigate the Evidence')).toBeInTheDocument();
      expect(screen.getByText('Interrogate the Possibilities')).toBeInTheDocument();
      expect(screen.getByText('Reveal the Truth')).toBeInTheDocument();

      // Difficulty levels
      expect(screen.getByText('Apprentice Detective')).toBeInTheDocument();
      expect(screen.getByText('Senior Detective')).toBeInTheDocument();
      expect(screen.getByText('Superintendent')).toBeInTheDocument();
      expect(await screen.findByText('No investigations saved yet')).toBeInTheDocument();
    });

    it('loads saved investigation records in the Cases Dossier', async () => {
      vi.mocked(caseApi.getCaseDossier).mockResolvedValue({
        success: true,
        cases: [
          {
            caseId: 'CASE-619916',
            title: 'The Vanishing Heirloom',
            difficulty: 'medium',
            status: 'completed',
            createdAt: '2026-10-29T20:00:00.000Z',
            updatedAt: '2026-10-29T21:00:00.000Z',
            discoveredClueCount: 3,
            totalClues: 7,
            revealedHintCount: 1,
            totalHints: 3,
            currentScore: 155,
            finalScore: 155,
            selectedSuspectName: 'Marcus Vance',
            isCorrect: true,
          },
        ],
      });

      render(
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      );

      expect(await screen.findByText('The Vanishing Heirloom')).toBeInTheDocument();
      expect(screen.getByText('CASE-619916 · medium')).toBeInTheDocument();
      expect(screen.getByText('155', { selector: 'span' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /view results/i })).toHaveAttribute(
        'href',
        '/case/CASE-619916/result'
      );
    });

    it('shows a dossier loading error and allows retrying', async () => {
      vi.mocked(caseApi.getCaseDossier)
        .mockRejectedValueOnce(new Error('MongoDB unavailable'))
        .mockResolvedValueOnce({ success: true, cases: [] });

      render(
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      );

      expect(await screen.findByText('MongoDB unavailable')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: /retry action/i }));
      expect(await screen.findByText('No investigations saved yet')).toBeInTheDocument();
    });
  });

  // 2. Create Mystery Page
  describe('CreateMysteryPage', () => {
    it('allows typing a premise, changing difficulty, and commissions a mystery', async () => {
      vi.mocked(caseApi.createCase).mockResolvedValue({
        success: true,
        caseToken: 'token-abc',
        case: mockPublicCase,
      });

      render(
        <MemoryRouter initialEntries={['/create']}>
          <Routes>
            <Route path="/create" element={<CreateMysteryPage />} />
            <Route path="/case/:caseId" element={<div>Investigation Room Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByRole('heading', { name: /commission a new investigation/i })).toBeInTheDocument();

      const textarea = screen.getByPlaceholderText(/priceless diamond/i);
      const testPremise = 'A valuable ruby vanished from the gallery.';
      fireEvent.change(textarea, { target: { value: testPremise } });
      expect(screen.getByText(new RegExp(`${testPremise.length}/500 chars`, 'i'))).toBeInTheDocument();

      // Select Easy difficulty
      fireEvent.click(screen.getByText('Apprentice'));

      // Submit
      const generateBtn = screen.getByRole('button', { name: /generate mystery/i });
      await act(async () => {
        fireEvent.click(generateBtn);
      });

      expect(caseApi.createCase).toHaveBeenCalledWith(
        'A valuable ruby vanished from the gallery.',
        'easy',
        'Classic Noir'
      );

      // Navigated to investigation room
      await waitFor(() => {
        expect(screen.getByText('Investigation Room Page')).toBeInTheDocument();
      });
    });

    it('sends only one create request for rapid repeated form submissions', async () => {
      let resolveCreate!: (response: {
        success: boolean;
        caseToken: string;
        case: IPublicCase;
      }) => void;
      vi.mocked(caseApi.createCase).mockReturnValue(
        new Promise((resolve) => {
          resolveCreate = resolve;
        })
      );

      render(
        <MemoryRouter>
          <CreateMysteryPage />
        </MemoryRouter>
      );

      const form = screen.getByRole('button', { name: /generate mystery/i }).closest('form');
      expect(form).not.toBeNull();

      await act(async () => {
        fireEvent.submit(form!);
        fireEvent.submit(form!);
      });

      expect(caseApi.createCase).toHaveBeenCalledTimes(1);
      await act(async () => {
        resolveCreate({
          success: true,
          caseToken: 'token-abc',
          case: mockPublicCase,
        });
      });
    });

    it('rejects submission if premise is too short', async () => {
      render(
        <MemoryRouter>
          <CreateMysteryPage />
        </MemoryRouter>
      );

      const textarea = screen.getByPlaceholderText(/priceless diamond/i);
      fireEvent.change(textarea, { target: { value: 'ab' } });

      const generateBtn = screen.getByRole('button', { name: /generate mystery/i });
      await act(async () => {
        fireEvent.click(generateBtn);
      });

      expect(screen.getByText(/at least 5 characters/i)).toBeInTheDocument();
      expect(caseApi.createCase).not.toHaveBeenCalled();
    });
  });

  // 3. Investigation Room Page
  describe('InvestigationPage', () => {
    it('renders case briefing, suspects, clues, hints, and handles clue discovery', async () => {
      vi.mocked(caseApi.getCase).mockResolvedValue(mockPublicCase);

      const updatedCase: IPublicCase = {
        ...mockPublicCase,
        clues: [
          mockPublicCase.clues[0],
          {
            id: 'clue-2',
            title: 'Shattered Display Glass',
            description: 'Fine crystal shards from the showcase.',
            category: 'Forensics',
            discovered: true,
          },
          mockPublicCase.clues[2],
        ],
        discoveredClueIds: ['clue-1', 'clue-2'],
        provisionalScore: 0,
      };

      vi.mocked(caseApi.discoverClue).mockResolvedValue({
        success: true,
        discoveredClueId: 'clue-2',
        pointsAwarded: 5,
        currentScore: 0,
        case: updatedCase,
      });

      render(
        <MemoryRouter initialEntries={['/case/CASE-123456']}>
          <Routes>
            <Route path="/case/:caseId" element={<InvestigationPage />} />
          </Routes>
        </MemoryRouter>
      );

      // Loading finishes and case is rendered
      await waitFor(() => {
        expect(screen.getByText('The Diamond Gallery Disappearance')).toBeInTheDocument();
      });

      // Suspects rendered
      expect(screen.getByText('Julian Vance')).toBeInTheDocument();
      expect(screen.getByText('Clara Sterling')).toBeInTheDocument();
      expect(screen.getByText('Marcus Bell')).toBeInTheDocument();

      // Discovered clue vs sealed clue
      expect(screen.getByText('Bypassed Keypad')).toBeInTheDocument();
      expect(screen.getByText('Classified Evidence #2')).toBeInTheDocument();

      // Examine clue-2
      const examineButtons = screen.getAllByRole('button', { name: /examine/i });
      await act(async () => {
        fireEvent.click(examineButtons[0]);
      });

      expect(caseApi.discoverClue).toHaveBeenCalledWith('CASE-123456', 'clue-2');

      // Updated case now shows shattered display glass
      await waitFor(() => {
        expect(screen.getByText('Shattered Display Glass')).toBeInTheDocument();
      });
    });

    it('navigates to accusation tribunal when clicking Make Accusation', async () => {
      vi.mocked(caseApi.getCase).mockResolvedValue(mockPublicCase);

      render(
        <MemoryRouter initialEntries={['/case/CASE-123456']}>
          <Routes>
            <Route path="/case/:caseId" element={<InvestigationPage />} />
            <Route path="/case/:caseId/accuse" element={<div>Accusation Tribunal Screen</div>} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('The Diamond Gallery Disappearance')).toBeInTheDocument();
      });

      const accuseBtn = screen.getByRole('button', { name: /make accusation/i });
      await act(async () => {
        fireEvent.click(accuseBtn);
      });

      await waitFor(() => {
        expect(screen.getByText('Accusation Tribunal Screen')).toBeInTheDocument();
      });
    });
  });

  // 4. Accusation Page
  describe('AccusationPage', () => {
    it('requires selecting a suspect and checking confirmation before submitting', async () => {
      vi.mocked(caseApi.getCase).mockResolvedValue(mockPublicCase);
      vi.mocked(caseApi.accuseSuspect).mockResolvedValue({
        success: true,
        ...mockCompletedResult,
      });

      render(
        <MemoryRouter initialEntries={['/case/CASE-123456/accuse']}>
          <Routes>
            <Route path="/case/:caseId/accuse" element={<AccusationPage />} />
            <Route path="/case/:caseId/result" element={<div>Case Results Screen</div>} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('The Accusation Tribunal')).toBeInTheDocument();
      });

      const confirmBtn = screen.getByRole('button', { name: /confirm accusation/i });
      // Button is disabled initially
      expect(confirmBtn).toBeDisabled();

      // Select Julian Vance
      fireEvent.click(screen.getByText('Julian Vance'));

      // Check confirmation box
      const confirmationCheckbox = screen.getByText(/I confirm that I have evaluated all evidence/i);
      fireEvent.click(confirmationCheckbox);

      // Button is now enabled
      expect(confirmBtn).toBeEnabled();

      // Submit
      await act(async () => {
        fireEvent.click(confirmBtn);
      });

      expect(caseApi.accuseSuspect).toHaveBeenCalledWith('CASE-123456', 'suspect-1');

      // Navigates to results
      await waitFor(() => {
        expect(screen.getByText('Case Results Screen')).toBeInTheDocument();
      });
    });
  });

  // 5. Results Page
  describe('ResultsPage', () => {
    it('renders solved verdict, culprit details, score breakdown, and solution narrative', async () => {
      vi.mocked(caseApi.getCaseResult).mockResolvedValue(mockCompletedResult);

      render(
        <MemoryRouter initialEntries={['/case/CASE-123456/result']}>
          <Routes>
            <Route path="/case/:caseId/result" element={<ResultsPage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/case solved! culprit captured/i)).toBeInTheDocument();
      });

      // True perpetrator
      expect(screen.getByText('True Perpetrator')).toBeInTheDocument();
      expect(screen.getAllByText('Julian Vance').length).toBeGreaterThanOrEqual(2);

      // Score breakdown
      expect(screen.getAllByText('95')).toHaveLength(2);

      // Solution narrative
      expect(screen.getByText(/Julian Vance used his curator override/i)).toBeInTheDocument();
      expect(screen.getByText(/Digital keypad override proves high-level administrative clearance/i)).toBeInTheDocument();

      // Return home and Play again buttons
      expect(screen.getByRole('link', { name: /return home/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /play again/i })).toBeInTheDocument();
    });
  });
});
