import { ClockPort } from '../../src/ports/clock.port.js';

export class TestClock implements ClockPort {
  private currentTime: Date;

  constructor(initialTime: Date = new Date('2026-11-14T10:00:00.000Z')) {
    this.currentTime = new Date(initialTime.getTime());
  }

  now(): Date {
    return new Date(this.currentTime.getTime());
  }

  setTime(time: Date): void {
    this.currentTime = new Date(time.getTime());
  }

  advanceSeconds(seconds: number): void {
    this.currentTime = new Date(this.currentTime.getTime() + seconds * 1000);
  }
}
