import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

jest.mock('./users.service');

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
      controllers: [UsersController],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('register', () => {
    it('Should call the register user service and the send auth response function', async () => {
      const register = jest
        .spyOn(usersService as any, 'register')
        .mockResolvedValue({});
      const sendAuthRes = jest
        .spyOn(controller as any, 'sendAuthRes')
        .mockResolvedValue(undefined);

      const body = {};
      const res = {};

      await controller.register(body as any, res as any);

      expect(register).toHaveBeenCalled();
      expect(sendAuthRes).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('Should call the login user service and the send auth response function', async () => {
      const login = jest
        .spyOn(usersService as any, 'login')
        .mockResolvedValue({});
      const sendAuthRes = jest
        .spyOn(controller as any, 'sendAuthRes')
        .mockResolvedValue(undefined);

      const body = {};
      const res = {};

      await controller.login(body as any, res as any);

      expect(login).toHaveBeenCalled();
      expect(sendAuthRes).toHaveBeenCalled();
    });
  });
});
