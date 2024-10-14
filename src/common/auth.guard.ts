import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { verify as verifyJwt } from 'jsonwebtoken';
import { PrismaService } from './prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  private accessTokenFromCookies(cookies: Record<string, string>) {
    return (cookies.access_token || '').replace('Bearer ', '');
  }

  private async validateUserId(id: any) {
    const parsedUserId = parseInt(typeof id === 'string' ? id : '');
    if (isNaN(parsedUserId)) throw new Error('id must be a numeric string');

    const user = await this.prisma.users.findFirst({
      where: { id: parsedUserId },
    });
    if (!user) throw new Error('user not found');
  }

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>();
    const token = this.accessTokenFromCookies(req.cookies);

    try {
      const payload = verifyJwt(token, process.env.JWT_SIGNING_KEY, {
        algorithms: ['HS256'],
      });

      await this.validateUserId(payload.sub);

      return true;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
