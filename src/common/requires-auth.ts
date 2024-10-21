import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { UnauthorizedErrorResponse } from './dto/common.dto';
import { AuthGuard } from './auth.guard';

export const RequiresAuth = () => {
  return applyDecorators(
    ApiUnauthorizedResponse({
      description: 'Eroare de autentificare',
      type: UnauthorizedErrorResponse,
    }),
    UseGuards(AuthGuard),
    ApiCookieAuth(),
  );
};
