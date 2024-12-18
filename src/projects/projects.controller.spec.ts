import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { Chance } from 'chance';
import { PrismaService } from '../common/prisma.service';

jest.mock('./projects.service');

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let projectsService: ProjectsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectsService, PrismaService],
      controllers: [ProjectsController],
    }).compile();

    controller = module.get<ProjectsController>(ProjectsController);
    projectsService = module.get<ProjectsService>(ProjectsService);
  });

  describe('createProject', () => {
    it('Should call the createProject project service and the send the id as a result', async () => {
      const id = new Chance().integer({ min: 1, max: 1000 });
      const createProject = jest
        .spyOn(projectsService as any, 'createProject')
        .mockResolvedValue({ id });

      const body = {};
      const photos = [];

      const res = await controller.createProject(body as any, photos as any);

      expect(createProject).toHaveBeenCalled();
      expect(res.id).toEqual(id);
    });
  });

  describe('getProjects', () => {
    it('Should call the getProjects project service and the send the results and meta as a result', async () => {
      const results = new Chance().string();
      const meta = new Chance().string();

      const getProjects = jest
        .spyOn(projectsService as any, 'getProjects')
        .mockResolvedValue({ results, meta });

      const query = new Chance().string();

      const res = await controller.getProjects(query as any);

      expect(getProjects).toHaveBeenCalledWith(query, false);
      expect(res.results).toEqual(results);
      expect(res.meta).toEqual(meta);
    });
  });

  describe('getPublicProjects', () => {
    it('Should call the getProjects project service and the send the results and meta as a result', async () => {
      const results = new Chance().string();
      const meta = new Chance().string();

      const getProjects = jest
        .spyOn(projectsService as any, 'getProjects')
        .mockResolvedValue({ results, meta });

      const query = new Chance().string();

      const res = await controller.getPublicProjects(query as any);

      expect(getProjects).toHaveBeenCalledWith(query, true);
      expect(res.results).toEqual(results);
      expect(res.meta).toEqual(meta);
    });
  });

  describe('getProjectById', () => {
    it('Should call the getProjectInfo project service and the send the project as a result', async () => {
      const result = new Chance().string();

      const getProjectInfo = jest
        .spyOn(projectsService as any, 'getProjectInfo')
        .mockResolvedValue(result);

      const query = { id: new Chance().string() };

      const res = await controller.getProjectById(query as any);

      expect(getProjectInfo).toHaveBeenCalledWith(query.id, false);
      expect(res.project).toEqual(result);
    });
  });

  describe('getPublicProjectById', () => {
    it('Should call the getProjectInfo project service and the send the project as a result', async () => {
      const result = new Chance().string();

      const getProjectInfo = jest
        .spyOn(projectsService as any, 'getProjectInfo')
        .mockResolvedValue(result);

      const query = { id: new Chance().string() };

      const res = await controller.getPublicProjectById(query as any);

      expect(getProjectInfo).toHaveBeenCalledWith(query.id, true);
      expect(res.project).toEqual(result);
    });
  });

  describe('updateProject', () => {
    it('Should call the update project service and the send the project as a result', async () => {
      const update = jest
        .spyOn(projectsService as any, 'update')
        .mockResolvedValue(undefined);

      const params = {};
      const body = {};
      const photos = [];

      const res = await controller.updateProject(params as any, body, photos);

      expect(update).toHaveBeenCalled();
      expect(res).toBeUndefined();
    });
  });
});
