import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { ValidationException } from '../common/validation.exception';
import { RegisterBody } from './dto/register.dto';
import { hash } from 'bcrypt';

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
}
