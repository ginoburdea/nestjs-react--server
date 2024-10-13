import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { Chance } from 'chance';
import { PrismaService } from '../common/prisma.service';
import { truncateAllTables } from '../test-utils/truncateAllTables';
import { FileService, LocalFileService } from '../common/files.service';
import { readFileSync } from 'fs-extra';
import { resolve } from 'path';

describe('ProjectsService', () => {
  let service: ProjectsService;

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        PrismaService,
        { provide: FileService, useClass: LocalFileService },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);

    await truncateAllTables(service['prisma']);
  });

  describe('uploadPhotos', () => {
    it('Should upload the photos and add them to the database', async () => {
      const project = await service['prisma'].projects.create({
        data: { name: 'Lorem ipsum', url: 'example.com' },
      });

      const photosLength = new Chance().integer({ min: 1, max: 5 });
      const photos = new Array(photosLength).fill({
        content: readFileSync(resolve('test/data/photo.png')),
        mimeType: 'image/png',
      });

      const upload = jest
        .spyOn(service['fileService'], 'upload')
        .mockReturnValue(undefined);

      await service['uploadPhotos'](project.id, photos);

      expect(upload).toHaveBeenCalledTimes(photosLength);

      const createdPhotosInDb = await service['prisma'].projectPhotos.count({
        where: { projectId: project.id },
      });
      expect(createdPhotosInDb).toEqual(photosLength);
    });
  });

  describe('createProject', () => {
    it('Should create a project and upload the photos', async () => {
      const photosLength = new Chance().integer({ min: 1, max: 5 });

      const data = {
        name: new Chance().string({ length: 32 }),
        url: new Chance().url(),
        photos: new Array(photosLength).fill({
          content: readFileSync(resolve('test/data/photo.png')),
          mimeType: 'image/png',
        }),
      };

      const uploadPhotos = jest
        .spyOn(service as any, 'uploadPhotos')
        .mockReturnValue(undefined);

      const project = await service['createProject'](data);

      expect(uploadPhotos).toHaveBeenCalled();

      const createdProjectInDb = await service['prisma'].projects.findFirst({
        where: { id: project.id },
      });
      expect(createdProjectInDb).toMatchObject({
        name: data.name,
        url: data.url,
      });
    });
  });
});