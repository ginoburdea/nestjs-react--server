import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  private validateMasterPassword(masterPassword: string) {
    if (masterPassword !== process.env.MASTER_PASSWORD) {
      throw new BadRequestException('Master password is invalid');
    }
  }
}
