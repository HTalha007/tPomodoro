import { describe, it, expect } from 'vitest';
import { BreakRule } from '../src/rules/break.rule.js';
import { CreditCalculator } from '../src/rules/credit.calculator.js';

describe('Break & Credit Rules (AC-K01 - AC-K07, AC-K13)', () => {
  it('AC-K13: accepts 15 and 180 minutes, rejects 14 and 181 minutes', () => {
    expect(BreakRule.validatePlannedMinutes(15)).toBe(true);
    expect(BreakRule.validatePlannedMinutes(180)).toBe(true);
    expect(BreakRule.validatePlannedMinutes(60)).toBe(true);

    expect(BreakRule.validatePlannedMinutes(14)).toBe(false);
    expect(BreakRule.validatePlannedMinutes(181)).toBe(false);
    expect(BreakRule.validatePlannedMinutes(25.5)).toBe(false);
  });

  it('AC-K01: 30-minute round (1800s) breaks at 1200s with 300s break length', () => {
    const plannedSeconds = 30 * 60; // 1800
    const breakAfterSeconds = BreakRule.calculateBreakAfterSeconds(plannedSeconds);
    const breakLengthSeconds = BreakRule.calculateBreakLengthSeconds(breakAfterSeconds);

    expect(breakAfterSeconds).toBe(1200);
    expect(breakLengthSeconds).toBe(300);
  });

  it('AC-K02: 90-minute round (5400s) breaks at 3600s with 900s break length', () => {
    const plannedSeconds = 90 * 60; // 5400
    const breakAfterSeconds = BreakRule.calculateBreakAfterSeconds(plannedSeconds);
    const breakLengthSeconds = BreakRule.calculateBreakLengthSeconds(breakAfterSeconds);

    expect(breakAfterSeconds).toBe(3600);
    expect(breakLengthSeconds).toBe(900);
  });

  it('AC-K03: 67 minutes (4020s) gets 300s break; 68 minutes (4080s) gets 900s break', () => {
    // 67 minutes = 4020s -> 4020 * 2 / 3 = 2680s (< 2700 threshold)
    const break67 = BreakRule.calculateBreakAfterSeconds(4020);
    expect(break67).toBe(2680);
    expect(BreakRule.calculateBreakLengthSeconds(break67)).toBe(300);

    // 68 minutes = 4080s -> 4080 * 2 / 3 = 2720s (>= 2700 threshold)
    const break68 = BreakRule.calculateBreakAfterSeconds(4080);
    expect(break68).toBe(2720);
    expect(BreakRule.calculateBreakLengthSeconds(break68)).toBe(900);
  });

  it('AC-K06: calculateAbandoned gives outcome abandoned and 0 credited seconds', () => {
    const now = new Date('2026-11-14T10:00:00Z');
    const result = CreditCalculator.calculateAbandoned(now);

    expect(result.outcome).toBe('abandoned');
    expect(result.creditedSeconds).toBe(0);
    expect(result.closedAt).toEqual(now);
  });

  it('AC-K07: 30-min round closed 100s after resume yields half credit of 650 seconds', () => {
    const plannedSeconds = 1800;
    const breakAfterSeconds = 1200;
    const resumedAt = new Date('2026-11-14T10:25:00Z');
    const closedAt = new Date(resumedAt.getTime() + 100 * 1000); // 100 seconds later

    const result = CreditCalculator.calculateHalf(
      plannedSeconds,
      breakAfterSeconds,
      resumedAt,
      closedAt
    );

    // Accumulated focus = 1200 + 100 = 1300s. Half = floor(1300 / 2) = 650s.
    expect(result.outcome).toBe('half');
    expect(result.creditedSeconds).toBe(650);
    expect(result.closedAt).toEqual(closedAt);
  });

  it('AC-K08: full completion yields planned seconds and mathematical closedAt', () => {
    const plannedSeconds = 1800;
    const breakAfterSeconds = 1200;
    const resumedAt = new Date('2026-11-14T10:25:00Z');

    const result = CreditCalculator.calculateFull(
      plannedSeconds,
      resumedAt,
      breakAfterSeconds
    );

    const expectedClosedAt = new Date(resumedAt.getTime() + 600 * 1000); // 1800 - 1200 = 600s
    expect(result.outcome).toBe('full');
    expect(result.creditedSeconds).toBe(1800);
    expect(result.closedAt).toEqual(expectedClosedAt);
  });
});
