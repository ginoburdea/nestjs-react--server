import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { Chance } from 'chance';
import { PrismaService } from '../common/prisma.service';
import { expectValidationError } from '../test-utils/expectValidationError';
import { truncateAllTables } from '../test-utils/truncateAllTables';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, PrismaService],
    }).compile();

    service = module.get<UsersService>(UsersService);

    await truncateAllTables(service['prisma']);
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

  describe('createUser', () => {
    it('Should create a user when the email is not in use', async () => {
      const userData = {
        name: new Chance().name(),
        email: new Chance().email(),
        password: new Chance().string({ length: 16 }),
      };

      const user = await service['createUser'](userData);

      expect(user).toMatchObject({
        name: userData.name,
        email: userData.email,
      });

      const userFromDb = await service['prisma'].users.findFirst({
        where: { id: user.id },
      });
      expect(userFromDb).not.toBeNull();
    });

    it('Should throw when the email is already in use', async () => {
      const userData = {
        name: new Chance().name(),
        email: new Chance().email(),
        password: new Chance().string({ length: 16 }),
      };
      await service['createUser'](userData);

      await expectValidationError('email', 'EMAIL_IN_USE', () =>
        service['createUser'](userData),
      );
    });
  });
});
