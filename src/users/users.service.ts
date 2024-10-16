import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { ValidationException } from '../common/validation.exception';
import { RegisterBody } from './dto/register.dto';
import { compare, hash } from 'bcrypt';
import { sign as signJwt } from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import ms from 'ms';
import { LoginBody } from './dto/login.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private validateMasterPassword(masterPassword: string) {
    if (masterPassword !== process.env.MASTER_PASSWORD) {
      throw ValidationException.fromCode(
        'INVALID_MASTER_PASSWORD',
        'masterPassword',
      );
    }
  }

  private async validateCredentials(email: string, password: string) {
    const user = await this.prisma.users.findFirst({
      where: { email },
    });
    if (!user) {
      throw ValidationException.fromCode('INVALID_CREDENTIALS', [
        'email',
        'password',
      ]);
    }

    const passwordIsCorrect = await compare(password, user.password);
    if (!passwordIsCorrect) {
      throw ValidationException.fromCode('INVALID_CREDENTIALS', [
        'email',
        'password',
      ]);
    }

    return user;
  }

  private async createUser(data: Omit<RegisterBody, 'masterPassword'>) {
    const existingUser = await this.prisma.users.findFirst({
      where: { email: data.email },
    });

    if (existingUser) {
      throw ValidationException.fromCode('EMAIL_IN_USE', 'email');
    }

    const hashedPassword = await hash(data.password, 12);
    const user = await this.prisma.users.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
      },
    });

    return user;
  }

  private generateToken(userId: number) {
    const token = signJwt({}, process.env.JWT_SIGNING_KEY, {
      subject: userId.toString(),
      algorithm: 'HS256',
      keyid: randomBytes(64).toString('base64'),
      expiresIn: '30 days',
    });

    // subtract 5000 ms to account for eventual delays
    const expiresAt = new Date(Date.now() + ms('30 days') - 5000);

    return { token, expiresAt };
  }

  async register(data: RegisterBody) {
    this.validateMasterPassword(data.masterPassword);
    const user = await this.createUser(data);
    const { token, expiresAt: tokenExpiresAt } = this.generateToken(user.id);

    return { user, token, tokenExpiresAt };
  }

  async login(data: LoginBody) {
    const user = await this.validateCredentials(data.email, data.password);
    const { token, expiresAt: tokenExpiresAt } = this.generateToken(user.id);

    return { user, token, tokenExpiresAt };
  }
}
