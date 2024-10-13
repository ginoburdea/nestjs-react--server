import { Chance } from 'chance';
import { PrismaService } from '../common/prisma.service';
import { truncateAllTables } from '../test-utils/truncateAllTables';
import { AuthGuard } from './auth.guard';

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
});
