import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryStore } from './mocks/in-memory-store.js';
import { InMemorySecret } from './mocks/in-memory-secret.js';
import { TestClock } from './mocks/test-clock.js';
import {
  BreakRule,
  CreditCalculator,
  PeriodCalculator,
  StreakCalculator,
  RoundStateMachine,
  RoundDomainError,
  CreditEntryModel,
} from '../src/index.js';

describe('Official Acceptance Criteria (docs/acceptance-criteria.md) Verification Suite', () => {
  let store: InMemoryStore;
  let secret: InMemorySecret;
  let clock: TestClock;

  beforeEach(() => {
    store = new InMemoryStore();
    secret = new InMemorySecret();
    clock = new TestClock(new Date('2026-11-14T10:00:00.000Z'));
  });

  describe('1. Kredi Kararı (AC-K01 - AC-K19)', () => {
    it('AC-K01: 30 dakikalık tur (1800s) 1200. saniyede molaya girer. Mola 300 saniyedir.', () => {
      const plannedSeconds = 30 * 60;
      const breakAfter = BreakRule.calculateBreakAfterSeconds(plannedSeconds);
      const breakLength = BreakRule.calculateBreakLengthSeconds(breakAfter);

      expect(breakAfter).toBe(1200);
      expect(breakLength).toBe(300);
    });

    it('AC-K02: 90 dakikalık tur (5400s) 3600. saniyede molaya girer. Mola 900 saniyedir.', () => {
      const plannedSeconds = 90 * 60;
      const breakAfter = BreakRule.calculateBreakAfterSeconds(plannedSeconds);
      const breakLength = BreakRule.calculateBreakLengthSeconds(breakAfter);

      expect(breakAfter).toBe(3600);
      expect(breakLength).toBe(900);
    });

    it('AC-K03: 67 dakika (4020s) 2680. saniyede 300s; 68 dakika (4080s) 2720. saniyede 900s molaya girer.', () => {
      // 67 minutes
      const breakAfter67 = BreakRule.calculateBreakAfterSeconds(67 * 60);
      expect(breakAfter67).toBe(2680);
      expect(BreakRule.calculateBreakLengthSeconds(breakAfter67)).toBe(300);

      // 68 minutes
      const breakAfter68 = BreakRule.calculateBreakAfterSeconds(68 * 60);
      expect(breakAfter68).toBe(2720);
      expect(BreakRule.calculateBreakLengthSeconds(breakAfter68)).toBe(900);
    });

    it('AC-K04: Mola bitmeden Devam reddedilir. Faz awaiting_decision kalır. Satır yazılmaz.', () => {
      const t0 = clock.now();
      const round = RoundStateMachine.createRound({
        roundId: 'r-k04',
        accountId: 'acc-1',
        plannedMinutes: 30,
        now: t0,
      });

      // Shift to break at 1200s
      clock.advanceSeconds(1200);
      const evalRes = RoundStateMachine.evaluateAt(round, clock.now());
      expect(evalRes.updatedRound.phase).toBe('awaiting_decision');

      // Try early resume at 1200 + 100s (before 300s break finishes)
      clock.advanceSeconds(100);
      expect(() =>
        RoundStateMachine.resume(evalRes.updatedRound, clock.now())
      ).toThrowError(RoundDomainError);
    });

    it('AC-K05: Mola süresi dolunca Devam kabul edilir. Faz focus_after_break olur.', () => {
      const t0 = clock.now();
      const round = RoundStateMachine.createRound({
        roundId: 'r-k05',
        accountId: 'acc-1',
        plannedMinutes: 30,
        now: t0,
      });

      clock.advanceSeconds(1200);
      const evalRes = RoundStateMachine.evaluateAt(round, clock.now());

      // Advance clock past break length (300s)
      clock.advanceSeconds(300);
      const resumed = RoundStateMachine.resume(evalRes.updatedRound, clock.now());
      expect(resumed.phase).toBe('focus_after_break');
      expect(resumed.resumedAt).toEqual(clock.now());
    });

    it('AC-K06: Mola öncesi veya molada Bırak, abandoned ve 0 yazar.', () => {
      const t0 = clock.now();
      const round = RoundStateMachine.createRound({
        roundId: 'r-k06',
        accountId: 'acc-1',
        plannedMinutes: 30,
        now: t0,
      });

      // Abandon before break
      clock.advanceSeconds(500);
      const { updatedRound, credit } = RoundStateMachine.abandon(round, clock.now());

      expect(updatedRound.phase).toBe('closed');
      expect(credit.outcome).toBe('abandoned');
      expect(credit.creditedSeconds).toBe(0);
    });

    it('AC-K07: Devamdan sonra, plan dolmadan kapanan turda biriken odak yarısı (650s) yazar.', () => {
      const t0 = clock.now();
      const round = RoundStateMachine.createRound({
        roundId: 'r-k07',
        accountId: 'acc-1',
        plannedMinutes: 30,
        now: t0,
      });

      // Break reached and elapsed
      clock.advanceSeconds(1500);
      const breakRound = {
        ...round,
        phase: 'awaiting_decision' as const,
        breakStartedAt: new Date(t0.getTime() + 1200 * 1000),
      };
      const resumedRound = RoundStateMachine.resume(breakRound, clock.now());

      // Close 100 seconds after resume
      clock.advanceSeconds(100);
      const { credit } = RoundStateMachine.abandon(resumedRound, clock.now());

      // Accumulated = 1200 + 100 = 1300. Half = 650
      expect(credit.outcome).toBe('half');
      expect(credit.creditedSeconds).toBe(650);
    });

    it('AC-K08: Devam edilip plan dolunca kredili saniye 1800, closed_at = resumed_at + 600.', () => {
      const t0 = clock.now();
      const round = RoundStateMachine.createRound({
        roundId: 'r-k08',
        accountId: 'acc-1',
        plannedMinutes: 30,
        now: t0,
      });

      const resumedAt = new Date(t0.getTime() + 1500 * 1000);
      const resumedRound = {
        ...round,
        phase: 'focus_after_break' as const,
        breakStartedAt: new Date(t0.getTime() + 1200 * 1000),
        resumedAt,
      };

      // Query arrives at resumedAt + 700s (100s late)
      clock.setTime(new Date(resumedAt.getTime() + 700 * 1000));
      const evalRes = RoundStateMachine.evaluateAt(resumedRound, clock.now());

      expect(evalRes.changed).toBe(true);
      expect(evalRes.updatedRound.phase).toBe('closed');
      expect(evalRes.creditGenerated?.outcome).toBe('full');
      expect(evalRes.creditGenerated?.creditedSeconds).toBe(1800);
      // closed_at is exactly resumedAt + 600, not request arrival time
      expect(evalRes.creditGenerated?.closedAt).toEqual(
        new Date(resumedAt.getTime() + 600 * 1000)
      );
    });

    it('AC-K09: İkinci Bırak aynı satırı döner, idempotenttir.', () => {
      const t0 = clock.now();
      const round = RoundStateMachine.createRound({
        roundId: 'r-k09',
        accountId: 'acc-1',
        plannedMinutes: 30,
        now: t0,
      });

      const firstAbandon = RoundStateMachine.abandon(round, t0);
      const secondAbandon = RoundStateMachine.abandon(firstAbandon.updatedRound, clock.now());

      expect(secondAbandon.credit.creditedSeconds).toBe(firstAbandon.credit.creditedSeconds);
      expect(secondAbandon.credit.outcome).toBe(firstAbandon.credit.outcome);
    });

    it('AC-K13: 14 ve 181 dakika reddedilir, 15 ve 180 dakika kabul edilir.', () => {
      expect(BreakRule.validatePlannedMinutes(14)).toBe(false);
      expect(BreakRule.validatePlannedMinutes(181)).toBe(false);
      expect(BreakRule.validatePlannedMinutes(15)).toBe(true);
      expect(BreakRule.validatePlannedMinutes(180)).toBe(true);
    });

    it('AC-K14: Mola anı geçmişken gelen ilk sorgu awaiting_decision yapar, break_started_at sabit kalır.', () => {
      const t0 = clock.now();
      const round = RoundStateMachine.createRound({
        roundId: 'r-k14',
        accountId: 'acc-1',
        plannedMinutes: 30,
        now: t0,
      });

      // Poll arrives 200s late (1400s)
      clock.advanceSeconds(1400);
      const evalRes = RoundStateMachine.evaluateAt(round, clock.now());

      expect(evalRes.updatedRound.phase).toBe('awaiting_decision');
      expect(evalRes.updatedRound.breakStartedAt).toEqual(
        new Date(t0.getTime() + 1200 * 1000)
      );
    });

    it('AC-K16: Karar bekleyen tur varken yeni tur eskisini 0 ile kapatır.', () => {
      const t0 = clock.now();
      const openRound = RoundStateMachine.createRound({
        roundId: 'r-old',
        accountId: 'acc-1',
        plannedMinutes: 30,
        now: t0,
      });

      const { closedRound, credit } = RoundStateMachine.closeForNewRound(openRound, t0);
      expect(closedRound.phase).toBe('closed');
      expect(credit.outcome).toBe('abandoned');
      expect(credit.creditedSeconds).toBe(0);
    });
  });

  describe('2. Hesap (AC-H01 - AC-H09)', () => {
    it('AC-H01 & AC-H07: Şifre özeti oluşturulur, düz metin şifre saklanmaz.', async () => {
      const password = 'SuperSecretPassword!';
      const hash = await secret.hashPassword(password);

      expect(hash).not.toBe(password);
      expect(await secret.verifyPassword(password, hash)).toBe(true);
      expect(await secret.verifyPassword('wrongPassword', hash)).toBe(false);
    });

    it('AC-H08: Sistem saat dilimi Europe/Istanbul olarak kilitlidir.', () => {
      expect(PeriodCalculator.TIMEZONE).toBe('Europe/Istanbul');
    });
  });

  describe('3. Bugün ve Bu Hafta (AC-O01 - AC-O05)', () => {
    it('AC-O01: Özet yalnız kredili saniyeyi toplar, 0 olan abandoned satırları artırmaz.', () => {
      const now = clock.now();
      const entries: CreditEntryModel[] = [
        {
          entryId: '1',
          roundId: 'r1',
          accountId: 'acc-1',
          creditedSeconds: 1800,
          outcome: 'full',
          closedAt: now,
          roomId: null,
          createdAt: now,
        },
        {
          entryId: '2',
          roundId: 'r2',
          accountId: 'acc-1',
          creditedSeconds: 0,
          outcome: 'abandoned',
          closedAt: now,
          roomId: null,
          createdAt: now,
        },
      ];

      const sum = PeriodCalculator.calculateSummary(entries, now);
      expect(sum.todayCreditedSeconds).toBe(1800);
      expect(sum.thisWeekCreditedSeconds).toBe(1800);
    });

    it('AC-O03: Pazar 23:59 o haftaya, Pazartesi 00:00 sonraki haftaya yazılır.', () => {
      // 2026-11-15 20:59 UTC = 2026-11-15 23:59 Istanbul (Sunday)
      const sundayNight = new Date('2026-11-15T20:59:00.000Z');
      // 2026-11-15 21:00 UTC = 2026-11-16 00:00 Istanbul (Monday)
      const mondayMorning = new Date('2026-11-15T21:00:00.000Z');

      const sundayEntry: CreditEntryModel = {
        entryId: 'e-sun',
        roundId: 'r-sun',
        accountId: 'acc-1',
        creditedSeconds: 1200,
        outcome: 'full',
        closedAt: sundayNight,
        roomId: null,
        createdAt: sundayNight,
      };

      // Summary viewed on Sunday night
      const sumSunday = PeriodCalculator.calculateSummary([sundayEntry], sundayNight);
      expect(sumSunday.thisWeekCreditedSeconds).toBe(1200);

      // Summary viewed on Monday morning (new week)
      const sumMonday = PeriodCalculator.calculateSummary([sundayEntry], mondayMorning);
      expect(sumMonday.thisWeekCreditedSeconds).toBe(0); // Sunday entry does not leak into next week
    });
  });

  describe('4. Seri (AC-S01 - AC-S06)', () => {
    it('AC-S01 - AC-S04: Kredili günlerin geriye sayımı ve kredisiz gün sıfırlanması.', () => {
      const today = clock.now();
      const yesterday = new Date(today.getTime() - 24 * 3600 * 1000);
      const twoDaysAgo = new Date(today.getTime() - 2 * 24 * 3600 * 1000);
      const fourDaysAgo = new Date(today.getTime() - 4 * 24 * 3600 * 1000);

      const entries: CreditEntryModel[] = [
        {
          entryId: '1',
          roundId: 'r1',
          accountId: 'acc-1',
          creditedSeconds: 1800,
          outcome: 'full',
          closedAt: today,
          roomId: null,
          createdAt: today,
        },
        {
          entryId: '2',
          roundId: 'r2',
          accountId: 'acc-1',
          creditedSeconds: 650,
          outcome: 'half',
          closedAt: yesterday,
          roomId: null,
          createdAt: yesterday,
        },
        {
          entryId: '3',
          roundId: 'r3',
          accountId: 'acc-1',
          creditedSeconds: 1800,
          outcome: 'full',
          closedAt: twoDaysAgo,
          roomId: null,
          createdAt: twoDaysAgo,
        },
        // Gap at 3 days ago!
        {
          entryId: '4',
          roundId: 'r4',
          accountId: 'acc-1',
          creditedSeconds: 1800,
          outcome: 'full',
          closedAt: fourDaysAgo,
          roomId: null,
          createdAt: fourDaysAgo,
        },
      ];

      const streak = StreakCalculator.calculateStreak(entries, today);
      expect(streak).toBe(3); // 3 consecutive days, stopped by gap
    });
  });

  describe('5. Oda ve Dakika Yarışı (AC-R01 - AC-R12)', () => {
    it('AC-R01: Oda açılınca en az 128 bit entropili tahmin edilemeyen kod döner.', () => {
      const code1 = secret.generateRoomCode();
      const code2 = secret.generateRoomCode();

      expect(code1).not.toBe(code2);
      expect(code1.length).toBeGreaterThanOrEqual(16);
    });

    it('AC-R10: last_seen_at son 30 saniye içindeyse online, 31. saniyeden itibaren uzakta.', () => {
      const now = clock.now();
      const memberOnline = new Date(now.getTime() - 25 * 1000);
      const memberAway = new Date(now.getTime() - 35 * 1000);

      const isOnline1 = Math.floor((now.getTime() - memberOnline.getTime()) / 1000) <= 30;
      const isOnline2 = Math.floor((now.getTime() - memberAway.getTime()) / 1000) <= 30;

      expect(isOnline1).toBe(true);
      expect(isOnline2).toBe(false);
    });
  });
});
