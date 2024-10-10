import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { ValidationException } from '../common/validation.exception';

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
}
