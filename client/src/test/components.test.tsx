import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { SuspectCard } from '../components/SuspectCard.tsx';
import { ClueCard } from '../components/ClueCard.tsx';
import { HintDrawer } from '../components/HintDrawer.tsx';
import { ScoreBreakdownCard } from '../components/ScoreBreakdownCard.tsx';
import { ErrorBanner } from '../components/ErrorBanner.tsx';
import { LoadingScreen } from '../components/LoadingScreen.tsx';
import { IPublicClue, IPublicHint, ISuspect, IVerdict } from '../types/case.ts';

describe('Frontend Component Tests', () => {
  it('renders SuspectCard with motive, alibi, and occupation', () => {
    const mockSuspect: ISuspect = {
      id: 'suspect-1',
      name: 'Lord Reginald',
      description: 'Wealthy aristocrat with lavish debts.',
      motive: 'Bankrupt from gambling.',
      alibi: 'In the smoking lounge.',
      occupation: 'Aristocrat',
    };

    render(<SuspectCard suspect={mockSuspect} />);

    expect(screen.getByText('Lord Reginald')).toBeInTheDocument();
    expect(screen.getByText('Wealthy aristocrat with lavish debts.')).toBeInTheDocument();
    expect(screen.getByText('Bankrupt from gambling.')).toBeInTheDocument();
    expect(screen.getByText('In the smoking lounge.')).toBeInTheDocument();
    expect(screen.getByText('Aristocrat')).toBeInTheDocument();
  });

  it('renders selectable SuspectCard and triggers onSelect when clicked', () => {
    const mockSuspect: ISuspect = {
      id: 'suspect-2',
      name: 'Evelyn Cross',
      description: 'Quiet librarian with access to archives.',
      motive: 'Family legacy.',
      alibi: 'In the reading room.',
    };

    const selectSpy = vi.fn();
    render(
      <SuspectCard
        suspect={mockSuspect}
        selectable
        isSelected={false}
        onSelect={selectSpy}
      />
    );

    fireEvent.click(screen.getByText('Evelyn Cross'));
    expect(selectSpy).toHaveBeenCalledTimes(1);
  });

  it('renders ClueCard in sealed state and triggers onDiscover on click', async () => {
    const mockClue: IPublicClue = {
      id: 'clue-1',
      title: 'Classified Evidence #1',
      description: 'This piece of evidence is sealed.',
      category: 'Physical',
      discovered: false,
    };

    const discoverSpy = vi.fn().mockResolvedValue(undefined);

    render(<ClueCard clue={mockClue} index={0} onDiscover={discoverSpy} />);

    expect(screen.getByText('Classified Evidence #1')).toBeInTheDocument();
    expect(screen.getByText(/sealed dossier/i)).toBeInTheDocument();

    const examineButton = screen.getByRole('button', { name: /examine/i });
    expect(examineButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(examineButton);
    });

    expect(discoverSpy).toHaveBeenCalledWith('clue-1');
  });

  it('renders ClueCard in discovered state without examine button', () => {
    const mockClue: IPublicClue = {
      id: 'clue-2',
      title: 'Scattered Glass Fragments',
      description: 'Glass shards from the display case found on the floor.',
      category: 'Forensics',
      discovered: true,
    };

    render(<ClueCard clue={mockClue} index={1} onDiscover={vi.fn()} />);

    expect(screen.getByText('Scattered Glass Fragments')).toBeInTheDocument();
    expect(screen.getByText('Glass shards from the display case found on the floor.')).toBeInTheDocument();
    expect(screen.getByText(/discovered \(\+5\)/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /examine/i })).not.toBeInTheDocument();
  });

  it('renders HintDrawer with remaining hints and triggers onRequestHint', async () => {
    const mockHints: IPublicHint[] = [
      { id: 'hint-1', text: 'Examine the footprints in the garden.', order: 1, revealed: true },
      { id: 'hint-2', text: 'Sealed hint #2', order: 2, revealed: false },
    ];

    const hintSpy = vi.fn().mockResolvedValue(undefined);

    render(
      <HintDrawer
        hints={mockHints}
        hintsRemaining={1}
        totalHints={2}
        onRequestHint={hintSpy}
      />
    );

    expect(screen.getByText(/1 remaining of 2/i)).toBeInTheDocument();
    expect(screen.getByText('Examine the footprints in the garden.')).toBeInTheDocument();

    const unlockButton = screen.getByRole('button', { name: /unlock hint \(-10 pts\)/i });
    expect(unlockButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(unlockButton);
    });

    expect(hintSpy).toHaveBeenCalledTimes(1);
  });

  it('disables hint unlock button when no hints remain', () => {
    const mockHints: IPublicHint[] = [
      { id: 'hint-1', text: 'First revealed hint.', order: 1, revealed: true },
      { id: 'hint-2', text: 'Second revealed hint.', order: 2, revealed: true },
    ];

    render(
      <HintDrawer
        hints={mockHints}
        hintsRemaining={0}
        totalHints={2}
        onRequestHint={vi.fn()}
      />
    );

    expect(screen.queryByRole('button', { name: /unlock hint/i })).not.toBeInTheDocument();
  });

  it('renders ScoreBreakdownCard with accurate score calculations', () => {
    const mockVerdict: IVerdict = {
      isCorrect: true,
      accusedSuspectId: 'suspect-1',
      accusedSuspectName: 'Lord Reginald',
      actualCulpritId: 'suspect-1',
      actualCulpritName: 'Lord Reginald',
      baseScore: 150,
      clueBonus: 35,
      hintPenalty: 20,
      finalScore: 165,
      discoveredCluesCount: 7,
      revealedHintsCount: 2,
    };

    render(<ScoreBreakdownCard verdict={mockVerdict} />);

    expect(screen.getAllByText('165')).toHaveLength(2);
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('+35')).toBeInTheDocument();
    expect(screen.getByText('-20')).toBeInTheDocument();
    expect(screen.getByText(/correct culprit/i)).toBeInTheDocument();
  });

  it('renders ErrorBanner with retry callback', () => {
    const retrySpy = vi.fn();
    render(
      <ErrorBanner
        title="Network Failure"
        message="Could not reach detective bureau server."
        onRetry={retrySpy}
      />
    );

    expect(screen.getByText('Network Failure')).toBeInTheDocument();
    expect(screen.getByText('Could not reach detective bureau server.')).toBeInTheDocument();

    const retryBtn = screen.getByRole('button', { name: /retry action/i });
    fireEvent.click(retryBtn);
    expect(retrySpy).toHaveBeenCalledTimes(1);
  });

  it('renders LoadingScreen with custom message and subtext', () => {
    render(
      <LoadingScreen
        message="Consulting Scotland Yard Archives"
        subtext="Cross-referencing forensic fingerprint records..."
      />
    );

    expect(screen.getByText('Consulting Scotland Yard Archives')).toBeInTheDocument();
    expect(screen.getByText('Cross-referencing forensic fingerprint records...')).toBeInTheDocument();
  });
});
