import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AccountModel } from '@tpomodoro/domain';

export const CurrentAccount = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AccountModel => {
    const request = ctx.switchToHttp().getRequest();
    return request.account;
  }
);
