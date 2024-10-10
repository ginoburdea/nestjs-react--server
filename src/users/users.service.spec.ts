import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { Chance } from 'chance';
import { PrismaService } from '../common/prisma.service';
import { expectValidationError } from '../test-utils/expectValidationError';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, PrismaService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('validateMasterPassword', () => {
    it('Should not throw if the master password is correct', async () => {
      const masterPassword = new Chance().string({ length: 32 });
      process.env.MASTER_PASSWORD = masterPassword;

      expect(() =>
        service['validateMasterPassword'](masterPassword),
      ).not.toThrow();
    });

    it('Should throw if the master password is incorrect', async () => {
      const masterPassword = new Chance().string({ length: 32 });
      const incorrectMasterPassword = new Chance().string({ length: 32 });
      process.env.MASTER_PASSWORD = incorrectMasterPassword;

      await expectValidationError(
        'masterPassword',
        'INVALID_MASTER_PASSWORD',
        () => service['validateMasterPassword'](masterPassword),
      );
    });
  });
});
