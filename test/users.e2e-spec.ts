import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { loadApp } from '../src/loaders/loadApp';
import { Chance } from 'chance';
import { Server } from 'http';
import Cookies from 'expect-cookies';
import { UsersService } from '../src/users/users.service';

describe('/users', () => {
  let app: INestApplication;
  let server: Server;

  beforeAll(async () => {
    app = await loadApp();
    server = app.getHttpServer();

    await app.listen(3000);
  }, 10000);

  afterAll(async () => {
    await app.close();
  });

  describe(`POST /register`, () => {
    it('Should register a user', async () => {
      const body = {
        name: new Chance().name(),
        email: new Chance().email().toLowerCase(),
        password: new Chance().string({ length: 16 }),
        masterPassword: new Chance().string({ length: 64 }),
      };
      process.env.MASTER_PASSWORD = body.masterPassword;

      await request(server)
        .post('/users/register')
        .send(body)
        .expect(200, { name: body.name, email: body.email })
        .expect(Cookies.set({ name: 'access_token' }));
    });
  });

  describe(`POST /login`, () => {
    it('Should login a user', async () => {
      const body = {
        name: new Chance().name(),
        email: new Chance().email().toLowerCase(),
        password: new Chance().string({ length: 16 }),
      };
      const usersService = app.get<UsersService>(UsersService);
      await usersService['createUser'](body);

      await request(server)
        .post('/users/login')
        .send(body)
        .expect(200, { name: body.name, email: body.email })
        .expect(Cookies.set({ name: 'access_token' }));
    });
  });
});
