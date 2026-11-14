import {
  Injectable,
  Inject,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import {
  StorePort,
  SecretPort,
  ClockPort,
  AccountModel,
} from '@tpomodoro/domain';
import { STORE_PORT } from '../../infrastructure/database/drizzle-store.adapter';
import { SECRET_PORT } from '../../infrastructure/security/argon2-secret.adapter';
import { CLOCK_PORT } from '../../infrastructure/clock/system-clock.adapter';
import { RegisterDto, LoginDto, AccountDto } from '@tpomodoro/contracts';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(STORE_PORT) private readonly store: StorePort,
    @Inject(SECRET_PORT) private readonly secret: SecretPort,
    @Inject(CLOCK_PORT) private readonly clock: ClockPort
  ) {}

  async register(dto: RegisterDto): Promise<{ account: AccountDto; sessionToken: string }> {
    const email = dto.email?.trim().toLowerCase();
    const password = dto.password;

    if (!email || !email.includes('@')) {
      throw new BadRequestException('Valid email address is required.');
    }
    if (!password || password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters.');
    }

    // AC-H02: Aynı e-posta ile ikinci kayıt reddedilir
    const existing = await this.store.findAccountByEmail(email);
    if (existing) {
      throw new ConflictException('An account with this email already exists.');
    }

    // AC-H01: Argon2id hash
    const passwordHash = await this.secret.hashPassword(password);
    const now = this.clock.now();

    const account = await this.store.createAccount({
      accountId: crypto.randomUUID(),
      email,
      passwordHash,
      timezone: 'Europe/Istanbul', // AC-H08
      createdAt: now,
    });

    const sessionToken = await this.createSessionForAccount(account.accountId);

    return {
      account: this.mapToDto(account),
      sessionToken,
    };
  }

  async login(dto: LoginDto): Promise<{ account: AccountDto; sessionToken: string }> {
    const email = dto.email?.trim().toLowerCase();
    const password = dto.password;

    if (!email || !password) {
      throw new BadRequestException('Email and password are required.');
    }

    const account = await this.store.findAccountByEmail(email);
    if (!account) {
      // AC-H04: Yanlış şifre / kullanıcı reddedilir
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isValid = await this.secret.verifyPassword(password, account.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const sessionToken = await this.createSessionForAccount(account.accountId);

    return {
      account: this.mapToDto(account),
      sessionToken,
    };
  }

  async logout(sessionToken: string): Promise<void> {
    // AC-H06: Çıkış, aynı taşıyıcıyla yapılan sonraki isteği reddeder
    await this.store.deleteSession(sessionToken);
  }

  private async createSessionForAccount(accountId: string): Promise<string> {
    const sessionToken = this.secret.generateSessionToken();
    // 30 days expiration
    const expiresAt = new Date(this.clock.now().getTime() + 30 * 24 * 3600 * 1000);
    await this.store.createSession(sessionToken, accountId, expiresAt);
    return sessionToken;
  }

  public mapToDto(account: AccountModel): AccountDto {
    return {
      accountId: account.accountId,
      email: account.email,
      timezone: account.timezone,
      createdAt: account.createdAt.toISOString(),
    };
  }
}
