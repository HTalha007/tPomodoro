import { describe, it, expect } from 'vitest';
import { RoundStateMachine, RoundDomainError } from '../src/state-machine/round.state-machine.js';

describe('Round State Machine (AC-K04, AC-K05, AC-K08, AC-K09, AC-K14 - AC-K16)', () => {
  const accountId = 'acc-123';
  const roundId = 'rnd-123';
  const t0 = new Date('2026-11-14T10:00:00.000Z');

  it('initializes round in focus_before_break with correct math', () => {
    const round = RoundStateMachine.createRound({
      roundId,
      accountId,
      plannedMinutes: 30,
      now: t0,
    });

    expect(round.phase).toBe('focus_before_break');
    expect(round.plannedSeconds).toBe(1800);
    expect(round.breakAfterSeconds).toBe(1200);
    expect(round.breakLengthSeconds).toBe(300);
    expect(round.startedAt).toEqual(t0);
    expect(round.breakStartedAt).toBeNull();
  });

  it('AC-K14: transitions to awaiting_decision when now >= breakThreshold, keeping mathematical timestamp', () => {
    const round = RoundStateMachine.createRound({
      roundId,
      accountId,
      plannedMinutes: 30,
      now: t0,
    });

    // 1000s in: still focus_before_break
    const t1000 = new Date(t0.getTime() + 1000 * 1000);
    const eval1 = RoundStateMachine.evaluateAt(round, t1000);
    expect(eval1.changed).toBe(false);
    expect(eval1.updatedRound.phase).toBe('focus_before_break');

    // 1250s in (late query): transitions to awaiting_decision, but breakStartedAt is exactly at 1200s
    const t1250 = new Date(t0.getTime() + 1250 * 1000);
    const eval2 = RoundStateMachine.evaluateAt(round, t1250);
    expect(eval2.changed).toBe(true);
    expect(eval2.updatedRound.phase).toBe('awaiting_decision');
    expect(eval2.updatedRound.breakStartedAt).toEqual(new Date(t0.getTime() + 1200 * 1000));
    expect(eval2.creditGenerated).toBeUndefined();
  });

  it('AC-K04: rejects early resume before breakLengthSeconds expires', () => {
    const round = RoundStateMachine.createRound({
      roundId,
      accountId,
      plannedMinutes: 30,
      now: t0,
    });

    const breakStarted = new Date(t0.getTime() + 1200 * 1000);
    const roundInBreak = {
      ...round,
      phase: 'awaiting_decision' as const,
      breakStartedAt: breakStarted,
    };

    // Attempt resume 100s into 300s break
    const earlyTime = new Date(breakStarted.getTime() + 100 * 1000);
    expect(() => RoundStateMachine.resume(roundInBreak, earlyTime)).toThrow(
      RoundDomainError
    );
  });

  it('AC-K05: accepts resume once break duration has elapsed', () => {
    const round = RoundStateMachine.createRound({
      roundId,
      accountId,
      plannedMinutes: 30,
      now: t0,
    });

    const breakStarted = new Date(t0.getTime() + 1200 * 1000);
    const roundInBreak = {
      ...round,
      phase: 'awaiting_decision' as const,
      breakStartedAt: breakStarted,
    };

    // Resume exactly at 300s (5 min) after break started
    const validResumeTime = new Date(breakStarted.getTime() + 300 * 1000);
    const resumedRound = RoundStateMachine.resume(roundInBreak, validResumeTime);

    expect(resumedRound.phase).toBe('focus_after_break');
    expect(resumedRound.resumedAt).toEqual(validResumeTime);
    expect(resumedRound.closedAt).toBeNull();
  });

  it('AC-K15 & AC-K08: closes with full credit once remaining focus duration finishes', () => {
    const resumedAt = new Date('2026-11-14T10:25:00.000Z');
    const round: any = {
      roundId,
      accountId,
      plannedSeconds: 1800,
      breakAfterSeconds: 1200,
      breakLengthSeconds: 300,
      phase: 'focus_after_break',
      startedAt: t0,
      breakStartedAt: new Date(t0.getTime() + 1200 * 1000),
      resumedAt,
      closedAt: null,
      outcome: null,
    };

    // Remaining focus = 1800 - 1200 = 600s
    // Check at 400s: not yet finished
    const t400 = new Date(resumedAt.getTime() + 400 * 1000);
    const evalNotDone = RoundStateMachine.evaluateAt(round, t400);
    expect(evalNotDone.changed).toBe(false);

    // Check at 650s (late inspection): closes with full credit and closed_at = resumedAt + 600s
    const t650 = new Date(resumedAt.getTime() + 650 * 1000);
    const evalDone = RoundStateMachine.evaluateAt(round, t650);

    expect(evalDone.changed).toBe(true);
    expect(evalDone.updatedRound.phase).toBe('closed');
    expect(evalDone.updatedRound.outcome).toBe('full');
    expect(evalDone.creditGenerated).toBeDefined();
    expect(evalDone.creditGenerated?.creditedSeconds).toBe(1800);
    expect(evalDone.creditGenerated?.closedAt).toEqual(
      new Date(resumedAt.getTime() + 600 * 1000)
    );
  });

  it('AC-K09: idempotent abandon on an already closed round', () => {
    const closedRound: any = {
      roundId,
      accountId,
      plannedSeconds: 1800,
      breakAfterSeconds: 1200,
      breakLengthSeconds: 300,
      phase: 'closed',
      startedAt: t0,
      closedAt: new Date(t0.getTime() + 500 * 1000),
      outcome: 'abandoned',
    };

    const result = RoundStateMachine.abandon(closedRound, new Date());
    expect(result.updatedRound.phase).toBe('closed');
    expect(result.credit.creditedSeconds).toBe(0);
    expect(result.credit.outcome).toBe('abandoned');
  });

  it('AC-K16: closeForNewRound handles awaiting, resumed, and completed states correctly', () => {
    // Case 1: In awaiting_decision -> closes as abandoned (0)
    const awaitingRound: any = {
      roundId: 'r1',
      accountId,
      plannedSeconds: 1800,
      breakAfterSeconds: 1200,
      breakLengthSeconds: 300,
      phase: 'awaiting_decision',
      startedAt: t0,
    };
    const c1 = RoundStateMachine.closeForNewRound(awaitingRound, new Date());
    expect(c1.closedRound.outcome).toBe('abandoned');
    expect(c1.credit.creditedSeconds).toBe(0);

    // Case 2: In focus_after_break but not full -> closes as half
    const resumedAt = new Date('2026-11-14T10:25:00.000Z');
    const activeResumedRound: any = {
      roundId: 'r2',
      accountId,
      plannedSeconds: 1800,
      breakAfterSeconds: 1200,
      breakLengthSeconds: 300,
      phase: 'focus_after_break',
      startedAt: t0,
      resumedAt,
    };
    const closeTime = new Date(resumedAt.getTime() + 100 * 1000); // 100s later
    const c2 = RoundStateMachine.closeForNewRound(activeResumedRound, closeTime);
    expect(c2.closedRound.outcome).toBe('half');
    expect(c2.credit.creditedSeconds).toBe(650);

    // Case 3: In focus_after_break and plan completed -> closes as full
    const fullTime = new Date(resumedAt.getTime() + 700 * 1000); // > 600s remaining
    const c3 = RoundStateMachine.closeForNewRound(activeResumedRound, fullTime);
    expect(c3.closedRound.outcome).toBe('full');
    expect(c3.credit.creditedSeconds).toBe(1800);
  });
});
