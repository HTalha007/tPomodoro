import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from '../modules/auth/auth.service';
import { RegisterDto, LoginDto, AuthResponseDto, AccountDto } from '@tpomodoro/contracts';
import { AuthGuard, SESSION_COOKIE_NAME } from '../infrastructure/security/auth.guard';
import { CurrentAccount } from '../infrastructure/security/current-account.decorator';
import { AccountModel } from '@tpomodoro/domain';

interface HttpResponse {
  cookie(name: string, val: string, options: Record<string, any>): void;
  clearCookie(name: string, options: Record<string, any>): void;
}

interface HttpRequest {
  sessionToken?: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) response: HttpResponse
  ): Promise<AuthResponseDto> {
    const { account, sessionToken } = await this.authService.register(dto);
    this.setSessionCookie(response, sessionToken);
    return { account };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: HttpResponse
  ): Promise<AuthResponseDto> {
    const { account, sessionToken } = await this.authService.login(dto);
    this.setSessionCookie(response, sessionToken);
    return { account };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async logout(
    @Req() request: HttpRequest,
    @Res({ passthrough: true }) response: HttpResponse
  ): Promise<{ success: boolean }> {
    const token = request.sessionToken;
    if (token) {
      await this.authService.logout(token);
    }
    response.clearCookie(SESSION_COOKIE_NAME, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    });
    return { success: true };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  getMe(@CurrentAccount() account: AccountModel): { account: AccountDto } {
    return { account: this.authService.mapToDto(account) };
  }

  private setSessionCookie(response: HttpResponse, token: string): void {
    response.cookie(SESSION_COOKIE_NAME, token, {
      httpOnly: true, // AC-H03
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 3600 * 1000, // 30 days
    });
  }
}
