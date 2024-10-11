import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterBody } from './dto/register.dto';
import { Response } from 'express';
import { Users } from '@prisma/client';

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

  @Post('register')
  async register(@Body() body: RegisterBody, @Res() res: Response) {
    const { user, token, tokenExpiresAt } =
      await this.usersService.register(body);
    this.sendAuthRes(res, user, token, tokenExpiresAt);
  }
}
