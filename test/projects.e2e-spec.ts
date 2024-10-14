import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { loadApp } from '../src/loaders/loadApp';
import { Chance } from 'chance';
import { Server } from 'http';
import { UsersService } from '../src/users/users.service';
import { resolve } from 'path';
import { PrismaService } from '../src/common/prisma.service';

describe('/projects', () => {
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

  describe(`POST /`, () => {
    it('Should create a project', async () => {
      const usersService = app.get(UsersService);
      const { token } = await usersService.register({
        name: new Chance().name(),
        email: new Chance().email().toLowerCase(),
        password: new Chance().string({ length: 16 }),
        masterPassword: process.env.MASTER_PASSWORD,
      });

      const filePath = resolve('test/data/photo.png');

      const project = {
        name: new Chance().string({ length: 32 }),
        url: new Chance().url(),
        description: new Chance().string({ length: 128 }),
        active: new Chance().bool(),
      };

      const res = await request(server)
        .post('/projects')
        .attach('photos', filePath)
        .attach('photos', filePath)
        .attach('photos', filePath)
        .field('name', project.name)
        .field('url', project.url)
        .field('description', project.description)
        .field('active', project.active)
        .set('Cookie', `access_token=${token}`);

      expect(res.statusCode).toEqual(200);
      expect(typeof res.body.id).toEqual('number');

      const prisma = app.get(PrismaService);
      const createdProject = await prisma.projects.findFirst({
        where: { id: res.body.id },
        include: { photos: true },
      });

      expect(createdProject).toMatchObject({
        name: project.name,
        url: project.url,
        description: project.description,
      });
      expect(createdProject.photos).toHaveLength(3);
    });
  });
});
