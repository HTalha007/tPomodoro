import { Injectable } from '@nestjs/common';
import { SecretPort } from '@tpomodoro/domain';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';

export const SECRET_PORT = 'SECRET_PORT';

@Injectable()
export class Argon2SecretAdapter implements SecretPort {
  async hashPassword(password: string): Promise<string> {
    // AC-H01: Argon2id hash
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, password);
    } catch {
      return false;
    }
  }

  generateSessionToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  generateRoomCode(): string {
    // AC-R01: At least 128 bits of entropy (16 bytes = 128 bits, 32 hex chars)
    return crypto.randomBytes(16).toString('hex');
  }
}
