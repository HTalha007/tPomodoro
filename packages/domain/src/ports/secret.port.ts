export interface SecretPort {
  hashPassword(password: string): Promise<string>;
  verifyPassword(password: string, hash: string): Promise<boolean>;
  generateSessionToken(): string;
  generateRoomCode(): string;
}
