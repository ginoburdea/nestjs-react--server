import { Body, Controller, HttpCode, Post, Res } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterBody } from './dto/register.dto';
import { Response } from 'express';
import { Users } from '@prisma/client';
import { LoginBody } from './dto/login.dto';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthResponse } from './dto/common.dto';
import { ApiCommonResponses } from 'src/common/api-common-responses';

const swaggerAuthResponseHeaders = {
  'Set-Cookie': {
    schema: {
      type: 'string',
      example:
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlBGYUwySzhiYTdsSWNLUnFuNjFUYnl3RmJ5NldGMVhJc3VpNTJwWnhiSUlyM2U5MjVWTGJlb1BvclZEMXdnZTZ5SVdyZG5KL3BsaElmTzFRbW5JOXVRPT0ifQ.eyJpYXQiOjE3Mjk0MzA2OTksImV4cCI6MTczMjAyMjY5OSwic3ViIjoiNDU4In0.0-jhbPx8XhRPnSWrzTyEGWKW22nxdYPK6HloRMpPcp0',
    },
  },
};

@ApiTags('Utilizatori')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  private sendAuthRes(
    res: Response,
    user: Users,
    token: string,
    tokenExpiresAt: Date,
  ) {
    res
      .cookie('access_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires: tokenExpiresAt,
      })
      .status(200)
      .send({
        name: user.name,
        email: user.email,
      });
  }

  @ApiOkResponse({
    description: 'Inregistrat cu succes',
    headers: swaggerAuthResponseHeaders,
    type: AuthResponse,
  })
  @ApiCommonResponses()
  @HttpCode(200)
  @Post('register')
  async register(@Body() body: RegisterBody, @Res() res: Response) {
    const { user, token, tokenExpiresAt } =
      await this.usersService.register(body);
    this.sendAuthRes(res, user, token, tokenExpiresAt);
  }

  @Post('login')
  async login(@Body() body: LoginBody, @Res() res: Response) {
    const { user, token, tokenExpiresAt } = await this.usersService.login(body);
    this.sendAuthRes(res, user, token, tokenExpiresAt);
  }
}
