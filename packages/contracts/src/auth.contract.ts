export interface RegisterDto {
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AccountDto {
  accountId: string;
  email: string;
  timezone: string;
  createdAt: string;
}

export interface AuthResponseDto {
  account: AccountDto;
}
