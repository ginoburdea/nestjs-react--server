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

      const photos = [];
      const body = {};

      const res = await controller.createProject(photos as any, body as any);

      expect(createProject).toHaveBeenCalled();
      expect(res.id).toEqual(id);
    });
  });
});
