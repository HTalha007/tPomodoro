import { Injectable } from '@nestjs/common';
import { ClockPort } from '@tpomodoro/domain';

export const CLOCK_PORT = 'CLOCK_PORT';

@Injectable()
export class SystemClockAdapter implements ClockPort {
  now(): Date {
    return new Date();
  }
}
