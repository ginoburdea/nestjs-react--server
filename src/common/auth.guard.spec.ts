import { Chance } from 'chance';
import { PrismaService } from '../common/prisma.service';
import { truncateAllTables } from '../test-utils/truncateAllTables';
import { AuthGuard } from './auth.guard';
import jwt from 'jsonwebtoken';
import { UnauthorizedException } from '@nestjs/common';

jest.mock('jsonwebtoken');

describe('AuthGuard', () => {
  let authGuard: AuthGuard;

  beforeEach(async () => {
    jest.resetAllMocks();

    authGuard = new AuthGuard(new PrismaService());

    await truncateAllTables(authGuard['prisma']);
  });

  describe('accessTokenFromCookies', () => {
    it('Should extract the access token from the given object', async () => {
      const expectedToken = new Chance().string({ length: 16 });
      const data = {
        access_token: 'Bearer ' + expectedToken,
      };

      const token = authGuard['accessTokenFromCookies'](data);

      expect(token).toEqual(expectedToken);
    });

    it('Should return an empty string when the access token is not present in the given object', async () => {
      const data = {};

      const token = authGuard['accessTokenFromCookies'](data);

      expect(token).toEqual('');
    });

    it("Should return an empty string when the access token starts with 'Bearer ' but does not contain a token", async () => {
      const data = {
        access_token: 'Bearer ',
      };

      const token = authGuard['accessTokenFromCookies'](data);

      expect(token).toEqual('');
    });
  });

  describe('validateUserId', () => {
    it('Should throw if the given id is not a string', async () => {
      const id = new Date();

      let errors = 0;
      try {
        await authGuard['validateUserId'](id);
      } catch (error) {
        errors++;
        expect(error.message).toEqual('id must be a numeric string');
      }
      expect(errors).toEqual(1);
    });

    it('Should throw if the given id is not a numeric string', async () => {
      const id = new Chance().string({ length: 16 });

      let errors = 0;
      try {
        await authGuard['validateUserId'](id);
      } catch (error) {
        errors++;
        expect(error.message).toEqual('id must be a numeric string');
      }
      expect(errors).toEqual(1);
    });

    it('Should throw if the user was not found', async () => {
      const id = new Chance().string({ length: 3, numeric: true });

      let errors = 0;
      try {
        await authGuard['validateUserId'](id);
      } catch (error) {
        errors++;
        expect(error.message).toEqual('user not found');
      }
      expect(errors).toEqual(1);
    });

    it('Should not throw if the user was found', async () => {
      const user = await authGuard['prisma'].users.create({
        data: {
          name: 'John Doe',
          email: 'john.doe@test.com',
          password: 'password123',
        },
      });
      const id = user.id.toString();

      let errors = 0;
      try {
        await authGuard['validateUserId'](id);
      } catch (error) {
        errors++;
      }
      expect(errors).toEqual(0);
    });
  });

  describe('canActivate', () => {
    it('Should call the this.accessTokenFromCookies, jwt.verify and this.validateUserId functions and return true if there are no errors', async () => {
      const context = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({}),
        }),
      };

      const accessTokenFromCookies = jest
        .spyOn(authGuard as any, 'accessTokenFromCookies')
        .mockReturnValue(undefined);

      (jwt.verify as jest.Mock).mockReturnValue({});

      const validateUserId = jest
        .spyOn(authGuard as any, 'validateUserId')
        .mockReturnValue(undefined);

      const res = await authGuard['canActivate'](context as any);

      expect(accessTokenFromCookies).toHaveBeenCalled();
      expect(jwt.verify as jest.Mock).toHaveBeenCalled();
      expect(validateUserId).toHaveBeenCalled();
      expect(res).toEqual(true);
    });

    it('Should throw UnauthorizedException if jwt.verify throws', async () => {
      const context = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({}),
        }),
      };

      const accessTokenFromCookies = jest
        .spyOn(authGuard as any, 'accessTokenFromCookies')
        .mockReturnValue(undefined);

      let errors = 0;
      try {
        await authGuard['canActivate'](context as any);
      } catch (error) {
        errors++;
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
      expect(errors).toEqual(1);

      expect(accessTokenFromCookies).toHaveBeenCalled();
      expect(jwt.verify as jest.Mock).toHaveBeenCalled();
    });

    it('Should throw UnauthorizedException if this.validateUserId throws', async () => {
      const context = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({}),
        }),
      };

      const accessTokenFromCookies = jest
        .spyOn(authGuard as any, 'accessTokenFromCookies')
        .mockReturnValue(undefined);

      (jwt.verify as jest.Mock).mockReturnValue({});

      const validateUserId = jest
        .spyOn(authGuard as any, 'validateUserId')
        .mockRejectedValue(new Error('lorem ipsum'));

      let errors = 0;
      try {
        await authGuard['canActivate'](context as any);
      } catch (error) {
        errors++;
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
      expect(errors).toEqual(1);

      expect(accessTokenFromCookies).toHaveBeenCalled();
      expect(jwt.verify as jest.Mock).toHaveBeenCalled();
      expect(validateUserId).toHaveBeenCalled();
    });
  });
});
