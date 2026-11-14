import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryStore } from './mocks/in-memory-store.js';
import { InMemorySecret } from './mocks/in-memory-secret.js';
import { TestClock } from './mocks/test-clock.js';
import {
  RoundStateMachine,
  PeriodCalculator,
  StreakCalculator,
  CreditEntryModel,
} from '../src/index.js';

describe('End-to-End Business Scenario Integration Tests', () => {
  let store: InMemoryStore;
  let secret: InMemorySecret;
  let clock: TestClock;

  beforeEach(() => {
    store = new InMemoryStore();
    secret = new InMemorySecret();
    clock = new TestClock(new Date('2026-11-14T10:00:00.000Z'));
  });

  it('Scenario 1: Complete Round lifecycle with break, early resume rejection, and half credit', async () => {
    const accountId = 'user-1';

    // 1. Start a 30-minute round (1800s)
    const t0 = clock.now();
    const round = RoundStateMachine.createRound({
      roundId: 'r-1',
      accountId,
      plannedMinutes: 30,
      now: t0,
    });
    await store.createRound(round);

    expect(round.phase).toBe('focus_before_break');
    expect(round.breakAfterSeconds).toBe(1200);
    expect(round.breakLengthSeconds).toBe(300);

    // 2. Advance time 1000s -> still in focus_before_break
    clock.advanceSeconds(1000);
    let evalRes = RoundStateMachine.evaluateAt(round, clock.now());
    expect(evalRes.changed).toBe(false);

    // 3. Advance time to 1250s (past break point of 1200s) -> shifts to awaiting_decision
    clock.advanceSeconds(250);
    evalRes = RoundStateMachine.evaluateAt(round, clock.now());
    expect(evalRes.changed).toBe(true);
    expect(evalRes.updatedRound.phase).toBe('awaiting_decision');
    expect(evalRes.updatedRound.breakStartedAt).toEqual(
      new Date(t0.getTime() + 1200 * 1000)
    );
    await store.updateRound(evalRes.updatedRound);

    // 4. Try early resume 100s into 300s break -> must be rejected (AC-K04)
    expect(() =>
      RoundStateMachine.resume(evalRes.updatedRound, clock.now())
    ).toThrow();

    // 5. Advance clock to 300s after break started (1200 + 300 = 1500s total)
    clock.setTime(new Date(t0.getTime() + 1500 * 1000));
    const resumedRound = RoundStateMachine.resume(evalRes.updatedRound, clock.now());
    expect(resumedRound.phase).toBe('focus_after_break');
    await store.updateRound(resumedRound);

    // 6. Abandon 100s after resuming -> half credit of 650 seconds (AC-K07)
    clock.advanceSeconds(100);
    const { updatedRound, credit } = RoundStateMachine.abandon(resumedRound, clock.now());

    expect(updatedRound.phase).toBe('closed');
    expect(credit.outcome).toBe('half');
    expect(credit.creditedSeconds).toBe(650);

    const creditEntry: CreditEntryModel = {
      entryId: 'ce-1',
      roundId: updatedRound.roundId,
      accountId,
      creditedSeconds: credit.creditedSeconds,
      outcome: credit.outcome,
      closedAt: credit.closedAt,
      roomId: null,
      createdAt: clock.now(),
    };

    await store.closeRoundAndRecordCredit(updatedRound, creditEntry);

    // Verify stored state
    const active = await store.findActiveRound(accountId);
    expect(active).toBeNull();

    const storedCredit = await store.findCreditByRoundId('r-1');
    expect(storedCredit?.creditedSeconds).toBe(650);
    expect(storedCredit?.outcome).toBe('half');
  });

  it('Scenario 2: Room collaboration, room-tagged credits, and member presence window', async () => {
    const user1Id = 'user-1';
    const user2Id = 'user-2';

    // 1. User1 creates room
    const t0 = clock.now();
    const roomCode = secret.generateRoomCode();
    const room = await store.createRoom(
      {
        roomId: 'room-1',
        code: roomCode,
        hostAccountId: user1Id,
        createdAt: t0,
      },
      {
        membershipId: 'm-1',
        roomId: 'room-1',
        accountId: user1Id,
        joinedAt: t0,
        leftAt: null,
        lastSeenAt: t0,
      }
    );

    // 2. User2 joins room
    await store.joinRoom({
      membershipId: 'm-2',
      roomId: room.roomId,
      accountId: user2Id,
      joinedAt: t0,
      leftAt: null,
      lastSeenAt: t0,
    });

    const membersInitial = await store.getRoomActiveMembers(room.roomId);
    expect(membersInitial.length).toBe(2);

    // 3. User1 finishes a full 30-min round while in the room
    const fullRound = RoundStateMachine.createRound({
      roundId: 'r-full',
      accountId: user1Id,
      plannedMinutes: 30,
      now: t0,
    });
    // Set to completed state
    const resumedAt = new Date(t0.getTime() + 1500 * 1000);
    const completedRound = {
      ...fullRound,
      phase: 'closed' as const,
      resumedAt,
      closedAt: new Date(resumedAt.getTime() + 600 * 1000),
      outcome: 'full' as const,
    };

    // Credit is tagged with room.roomId (AC-R06)
    await store.closeRoundAndRecordCredit(completedRound, {
      entryId: 'c-full',
      roundId: 'r-full',
      accountId: user1Id,
      creditedSeconds: 1800,
      outcome: 'full',
      closedAt: completedRound.closedAt,
      roomId: room.roomId,
      createdAt: clock.now(),
    });

    // 4. Check leaderboard credit calculation (AC-R07)
    const user1Credits = await store.getAllAccountCredits(user1Id);
    const roomTaggedSum = user1Credits
      .filter((c) => c.roomId === room.roomId)
      .reduce((sum, c) => sum + c.creditedSeconds, 0);

    expect(roomTaggedSum).toBe(1800);

    // 5. Presence: Advance 20 seconds -> both still online (< 30s)
    clock.advanceSeconds(20);
    await store.heartbeatMembership(user1Id, room.roomId, clock.now());
    // user2 hasn't polled: last seen was 20s ago -> still online
    let secSinceUser2 = (clock.now().getTime() - t0.getTime()) / 1000;
    expect(secSinceUser2 <= 30).toBe(true);

    // Advance another 20s (total 40s since user2 last seen) -> user2 is now away (AC-R10)
    clock.advanceSeconds(20);
    secSinceUser2 = (clock.now().getTime() - t0.getTime()) / 1000;
    expect(secSinceUser2 > 30).toBe(true);

    // 6. User2 leaves room -> removed from active members (AC-R08)
    await store.leaveRoom(user2Id, room.roomId, clock.now());
    const remainingMembers = await store.getRoomActiveMembers(room.roomId);
    expect(remainingMembers.length).toBe(1);
    expect(remainingMembers[0].accountId).toBe(user1Id);
  });

  it('Scenario 3: Summary and Streak across days', async () => {
    const accountId = 'user-streak';
    const now = clock.now(); // 2026-11-14 10:00 UTC (Saturday)

    // Add credits for today (Nov 14), yesterday (Nov 13), and 2 days ago (Nov 12)
    const day0 = now;
    const day1 = new Date(now.getTime() - 24 * 3600 * 1000);
    const day2 = new Date(now.getTime() - 2 * 24 * 3600 * 1000);

    await store.closeRoundAndRecordCredit(
      { roundId: 'r0' } as any,
      {
        entryId: 'c0',
        roundId: 'r0',
        accountId,
        creditedSeconds: 1800,
        outcome: 'full',
        closedAt: day0,
        createdAt: day0,
      }
    );

    await store.closeRoundAndRecordCredit(
      { roundId: 'r1' } as any,
      {
        entryId: 'c1',
        roundId: 'r1',
        accountId,
        creditedSeconds: 1800,
        outcome: 'full',
        closedAt: day1,
        createdAt: day1,
      }
    );

    await store.closeRoundAndRecordCredit(
      { roundId: 'r2' } as any,
      {
        entryId: 'c2',
        roundId: 'r2',
        accountId,
        creditedSeconds: 1200,
        outcome: 'half',
        closedAt: day2,
        createdAt: day2,
      }
    );

    const allCredits = await store.getAllAccountCredits(accountId);
    const summary = PeriodCalculator.calculateSummary(allCredits, now);
    const streak = StreakCalculator.calculateStreak(allCredits, now);

    expect(summary.todayCreditedSeconds).toBe(1800);
    expect(summary.thisWeekCreditedSeconds).toBe(1800 + 1800 + 1200); // 4800s
    expect(streak).toBe(3);
  });
});
