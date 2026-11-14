import { SecretPort } from '../../src/ports/secret.port.js';

export class InMemorySecret implements SecretPort {
  async hashPassword(password: string): Promise<string> {
    return `hash_${password}`;
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return hash === `hash_${password}`;
  }

  generateSessionToken(): string {
    return `token_${Math.random().toString(36).substring(2)}${Date.now()}`;
  }

  generateRoomCode(): string {
    return `code_${Math.random().toString(36).substring(2)}${Date.now()}`;
  }
}
