import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { StorePort, ClockPort, AccountModel } from '@tpomodoro/domain';
import { STORE_PORT } from '../database/drizzle-store.adapter';
import { CLOCK_PORT } from '../clock/system-clock.adapter';

export const SESSION_COOKIE_NAME = 'tpomodoro_session';

export interface AuthenticatedRequest {
  account: AccountModel;
  sessionToken: string;
  cookies?: Record<string, string>;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(STORE_PORT) private readonly store: StorePort,
    @Inject(CLOCK_PORT) private readonly clock: ClockPort
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies?.[SESSION_COOKIE_NAME];

    if (!token) {
      throw new UnauthorizedException('Authentication required: session cookie missing.');
    }

    const session = await this.store.findSession(token);
    if (!session) {
      throw new UnauthorizedException('Invalid or expired session.');
    }

    if (session.expiresAt < this.clock.now()) {
      await this.store.deleteSession(token);
      throw new UnauthorizedException('Session expired.');
    }

    const account = await this.store.findAccountById(session.accountId);
    if (!account) {
      throw new UnauthorizedException('Account not found.');
    }

    request.account = account;
    request.sessionToken = token;
    return true;
  }
}
