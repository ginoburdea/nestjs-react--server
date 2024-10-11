import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { Chance } from 'chance';
import { PrismaService } from '../common/prisma.service';
import { expectValidationError } from '../test-utils/expectValidationError';
import { truncateAllTables } from '../test-utils/truncateAllTables';
import { verify as verifyJwt } from 'jsonwebtoken';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    jest.resetAllMocks();

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

  describe('validateCredentials', () => {
    it('Should return the user if the credentials are valid', async () => {
      const userData = {
        name: new Chance().name(),
        email: new Chance().email(),
        password: new Chance().string({ length: 16 }),
      };
      await service['createUser'](userData);

      const user = await service['validateCredentials'](
        userData.email,
        userData.password,
      );

      expect(user).toMatchObject({
        email: userData.email,
      });
    });

    it('Should throw if the email is incorrect', async () => {
      const userData = {
        name: new Chance().name(),
        email: new Chance().email(),
        password: new Chance().string({ length: 16 }),
      };

      await expectValidationError('email', 'INVALID_CREDENTIALS', () =>
        service['validateCredentials'](userData.email, userData.password),
      );
      await expectValidationError('password', 'INVALID_CREDENTIALS', () =>
        service['validateCredentials'](userData.email, userData.password),
      );
    });

    it('Should throw if the password is incorrect', async () => {
      const userData = {
        name: new Chance().name(),
        email: new Chance().email(),
        password: new Chance().string({ length: 16 }),
      };
      await service['createUser'](userData);
      const incorrectPassword = new Chance().string({ length: 16 });

      await expectValidationError('email', 'INVALID_CREDENTIALS', () =>
        service['validateCredentials'](userData.email, incorrectPassword),
      );
      await expectValidationError('password', 'INVALID_CREDENTIALS', () =>
        service['validateCredentials'](userData.email, incorrectPassword),
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

  describe('generateToken', () => {
    it('Should generate a token', async () => {
      const jwtSecret = new Chance().string({ length: 32 });
      process.env.JWT_SIGNING_KEY = jwtSecret;
      const userId = new Chance().integer({ min: 1, max: 1000 });

      const { token, expiresAt } = service['generateToken'](userId);

      expect(expiresAt).toBeInstanceOf(Date);

      expect(() =>
        verifyJwt(token, jwtSecret, {
          algorithms: ['HS256'],
          subject: '' + userId,
        }),
      ).not.toThrow();
    });
  });

  describe('register', () => {
    it('Should validate the master password, create a user and generate a token', async () => {
      const userData = {
        name: new Chance().name(),
        email: new Chance().email(),
        password: new Chance().string({ length: 16 }),
        masterPassword: new Chance().string({ length: 16 }),
      };

      const validateMasterPassword = jest
        .spyOn(service as any, 'validateMasterPassword')
        .mockReturnValue(undefined);

      const createUser = jest
        .spyOn(service as any, 'createUser')
        .mockReturnValue({});

      const generateToken = jest
        .spyOn(service as any, 'generateToken')
        .mockReturnValue('');

      await service['register'](userData);

      expect(validateMasterPassword).toHaveBeenCalled();
      expect(createUser).toHaveBeenCalled();
      expect(generateToken).toHaveBeenCalled();
    });
  });
});
