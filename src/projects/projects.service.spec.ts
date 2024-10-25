import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { Chance } from 'chance';
import { PrismaService } from '../common/prisma.service';
import { truncateAllTables } from '../test-utils/truncateAllTables';
import { FileService, LocalFileService } from '../common/files.service';
import { readFileSync } from 'fs-extra';
import { resolve } from 'path';
import { expectValidationError } from '../test-utils/expectValidationError';
import { omit } from 'remeda';

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
        active: new Chance().bool(),
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

  describe('getSimplifiedProjects', () => {
    it('Should get projects and a photo for each one when no prisma filters are provided', async () => {
      const projectsCount = new Chance().integer({ min: 10, max: 25 });

      await service['prisma'].projects.createMany({
        data: Array(projectsCount)
          .fill(null)
          .map(() => ({
            name: new Chance().string({ length: 32 }),
            url: new Chance().url(),
            active: new Chance().bool(),
          })),
      });

      const createdProjects = await service['prisma'].projects.findMany({
        select: { id: true },
      });
      await service['prisma'].projectPhotos.createMany({
        data: createdProjects
          .map((project) => project.id)
          .map((projectId) => ({
            projectId,
            name:
              new Chance().string({ length: 8, alpha: true, numeric: true }) +
              '.png',
          })),
      });

      const simplifiedProjects = await service['getSimplifiedProjects'](
        25,
        {
          page: 1,
          order: 'newest',
        },
        {},
      );

      expect(simplifiedProjects).toHaveLength(projectsCount);
      for (const project of simplifiedProjects) {
        expect(typeof project.photo).toEqual('string');
      }
    });

    it('Should get projects and a photo for each one when prisma filters are provided', async () => {
      const projectsCount = new Chance().integer({ min: 10, max: 25 });

      await service['prisma'].projects.createMany({
        data: Array(projectsCount)
          .fill(null)
          .map(() => ({
            name: new Chance().string({ length: 32 }),
            url: new Chance().url(),
            active: new Chance().bool(),
          })),
      });

      const createdProjects = await service['prisma'].projects.findMany({
        select: { id: true },
      });
      await service['prisma'].projectPhotos.createMany({
        data: createdProjects
          .map((project) => project.id)
          .map((projectId) => ({
            projectId,
            name:
              new Chance().string({ length: 8, alpha: true, numeric: true }) +
              '.png',
          })),
      });

      const simplifiedProjects = await service['getSimplifiedProjects'](
        25,
        {
          page: 1,
          order: 'newest',
        },
        {
          active: true,
        },
      );

      for (const project of simplifiedProjects) {
        expect(typeof project.photo).toEqual('string');
        expect(project.active).toEqual(true);
      }
    });

    it('Should get projects and null instead of photos', async () => {
      const projectsCount = new Chance().integer({ min: 10, max: 25 });

      await service['prisma'].projects.createMany({
        data: Array(projectsCount)
          .fill(null)
          .map(() => ({
            name: new Chance().string({ length: 32 }),
            url: new Chance().url(),
            active: new Chance().bool(),
          })),
      });

      const simplifiedProjects = await service['getSimplifiedProjects'](
        25,
        {
          page: 1,
          order: 'newest',
        },
        {},
      );

      expect(simplifiedProjects).toHaveLength(projectsCount);
      for (const project of simplifiedProjects) {
        expect(project.photo).toBeNull();
      }
    });

    it('Should get projects on the first page', async () => {
      const projectsCount = new Chance().integer({ min: 30, max: 50 });

      await service['prisma'].projects.createMany({
        data: Array(projectsCount)
          .fill(null)
          .map(() => ({
            name: new Chance().string({ length: 32 }),
            url: new Chance().url(),
            active: new Chance().bool(),
          })),
      });

      const allProjects = await service['prisma'].projects.findMany({
        select: { id: true },
        orderBy: { createdAt: 'desc' },
      });

      const simplifiedProjects = await service['getSimplifiedProjects'](
        25,
        {
          page: 1,
          order: 'oldest',
        },
        {},
      );

      expect(simplifiedProjects).toHaveLength(25);
      expect(simplifiedProjects[0].id).toEqual(allProjects[0].id);
      expect(simplifiedProjects[24].id).toEqual(allProjects[24].id);
    });

    it('Should get projects on the second page', async () => {
      const projectsCount = new Chance().integer({ min: 30, max: 50 });

      await service['prisma'].projects.createMany({
        data: Array(projectsCount)
          .fill(null)
          .map(() => ({
            name: new Chance().string({ length: 32 }),
            url: new Chance().url(),
            active: new Chance().bool(),
          })),
      });

      const allProjects = await service['prisma'].projects.findMany({
        select: { id: true },
        orderBy: { createdAt: 'desc' },
      });

      const simplifiedProjects = await service['getSimplifiedProjects'](
        25,
        {
          page: 2,
          order: 'oldest',
        },
        {},
      );

      expect(simplifiedProjects).toHaveLength(projectsCount - 25);
      expect(simplifiedProjects[0].id).toEqual(allProjects[25].id);
      expect(simplifiedProjects.at(-1).id).toEqual(allProjects.at(-1).id);
    });
  });

  describe('genPaginationMeta', () => {
    it('Should get the correct values when there are multiple pages, previous and next pages', async () => {
      const { firstPage, lastPage, prevPage, nextPage } = service[
        'genPaginationMeta'
      ](2, 25, 75);

      expect(firstPage).toEqual(1);
      expect(lastPage).toEqual(3);
      expect(prevPage).toEqual(1);
      expect(nextPage).toEqual(3);
    });

    it('Should get the correct values when there are multiple pages and next pages', async () => {
      const { firstPage, lastPage, prevPage, nextPage } = service[
        'genPaginationMeta'
      ](1, 25, 75);

      expect(firstPage).toEqual(1);
      expect(lastPage).toEqual(3);
      expect(prevPage).toEqual(null);
      expect(nextPage).toEqual(2);
    });

    it('Should get the correct values when there are multiple pages and previous pages', async () => {
      const { firstPage, lastPage, prevPage, nextPage } = service[
        'genPaginationMeta'
      ](3, 25, 75);

      expect(firstPage).toEqual(1);
      expect(lastPage).toEqual(3);
      expect(prevPage).toEqual(2);
      expect(nextPage).toEqual(null);
    });

    it('Should get the correct values when is only one page', async () => {
      const { firstPage, lastPage, prevPage, nextPage } = service[
        'genPaginationMeta'
      ](1, 25, 25);

      expect(firstPage).toEqual(1);
      expect(lastPage).toEqual(1);
      expect(prevPage).toEqual(null);
      expect(nextPage).toEqual(null);
    });

    it('Should get the correct values when there are no pages', async () => {
      const { firstPage, lastPage, prevPage, nextPage } = service[
        'genPaginationMeta'
      ](1, 25, 0);

      expect(firstPage).toEqual(1);
      expect(lastPage).toEqual(1);
      expect(prevPage).toEqual(null);
      expect(nextPage).toEqual(null);
    });

    it('Should get the correct values when there are multiple pages and the current page is greater than the last page', async () => {
      const { firstPage, lastPage, prevPage, nextPage } = service[
        'genPaginationMeta'
      ](5, 25, 75);

      expect(firstPage).toEqual(1);
      expect(lastPage).toEqual(3);
      expect(prevPage).toEqual(4);
      expect(nextPage).toEqual(null);
    });
  });

  describe('getProjects', () => {
    it('Should call the genPaginationMeta and getSimplifiedProjects functions when the projects do not have to be active', async () => {
      const data = {
        order: new Chance().pickone(['newest', 'oldest']) as
          | 'newest'
          | 'oldest',
        page: new Chance().integer({ min: 1, max: 1000 }),
      };

      const genPaginationMeta = jest
        .spyOn(service as any, 'genPaginationMeta')
        .mockReturnValue({});
      const getSimplifiedProjects = jest
        .spyOn(service as any, 'getSimplifiedProjects')
        .mockReturnValue({});

      await service['getProjects'](data, false);

      expect(genPaginationMeta).toHaveBeenCalled();
      expect(getSimplifiedProjects).toHaveBeenCalledWith(25, data, {});
    });

    it('Should call the genPaginationMeta and getSimplifiedProjects functions with filters when the projects must be active', async () => {
      const data = {
        order: new Chance().pickone(['newest', 'oldest']) as
          | 'newest'
          | 'oldest',
        page: new Chance().integer({ min: 1, max: 1000 }),
      };

      const genPaginationMeta = jest
        .spyOn(service as any, 'genPaginationMeta')
        .mockReturnValue({});
      const getSimplifiedProjects = jest
        .spyOn(service as any, 'getSimplifiedProjects')
        .mockReturnValue({});

      await service['getProjects'](data, true);

      expect(genPaginationMeta).toHaveBeenCalled();
      expect(getSimplifiedProjects).toHaveBeenCalledWith(25, data, {
        active: true,
      });
    });
  });

  describe('getProjectInfo', () => {
    it('Should get a formatted project by id when the project is inactive', async () => {
      const photosCount = new Chance().integer({ min: 5, max: 25 });

      const project = await service['prisma'].projects.create({
        data: {
          name: new Chance().string({ length: 32 }),
          url: new Chance().url(),
          active: false,
          photos: {
            createMany: {
              data: Array(photosCount)
                .fill(null)
                .map(() => ({
                  name: new Chance().string({ length: 32 }) + '.png',
                })),
            },
          },
        },
      });

      const returnedProject = await service['getProjectInfo'](
        project.id,
        false,
      );

      expect(returnedProject).toMatchObject({
        id: project.id,
        name: project.name,
        url: project.url,
        description: project.description,
        active: project.active,
      });
      expect(returnedProject.photos).toHaveLength(photosCount);
    });

    it('Should get a formatted project by id when the project is active', async () => {
      const photosCount = new Chance().integer({ min: 5, max: 25 });

      const project = await service['prisma'].projects.create({
        data: {
          name: new Chance().string({ length: 32 }),
          url: new Chance().url(),
          active: true,
          photos: {
            createMany: {
              data: Array(photosCount)
                .fill(null)
                .map(() => ({
                  name: new Chance().string({ length: 32 }) + '.png',
                })),
            },
          },
        },
      });

      const returnedProject = await service['getProjectInfo'](
        project.id,
        true,
      );

      expect(returnedProject).toMatchObject({
        id: project.id,
        name: project.name,
        url: project.url,
        description: project.description,
        active: project.active,
      });
      expect(returnedProject.photos).toHaveLength(photosCount);
    });

    it('Should throw an error when the project does not exist', async () => {
      const fakeProjectId = new Chance().integer({ min: 1, max: 1000 });

      await expectValidationError('id', 'PROJECT_NOT_FOUND', () =>
        service['getProjectInfo'](fakeProjectId, false),
      );
    });
  });

  describe('validatePhotoNames', () => {
    it('Should not throw when all the photo names are valid', async () => {
      const project = await service['prisma'].projects.create({
        data: {
          name: new Chance().string({ length: 32 }),
          url: new Chance().url(),
          active: new Chance().bool(),
          photos: {
            createMany: {
              data: Array(new Chance().integer({ min: 5, max: 25 }))
                .fill(null)
                .map(() => ({
                  name: new Chance().string({ length: 32 }) + '.png',
                })),
            },
          },
        },
      });

      const photos = await service['prisma'].projectPhotos.findMany({
        select: {
          name: true,
        },
        where: {
          projectId: project.id,
        },
      });
      const photoNames = photos.map((photo) => photo.name);

      const fieldName = new Chance().string({
        length: 16,
        alpha: true,
        numeric: true,
      });

      let errors = 0;
      try {
        await service['validatePhotoNames'](fieldName, project.id, photoNames);
      } catch {
        errors++;
      }
      expect(errors).toEqual(0);
    });

    it('Should throw when a photo name is invalid', async () => {
      const fakeProjectId = new Chance().integer({ min: 1, max: 1000 });
      const fakeProtoNames = new Array(
        new Chance().integer({ min: 1, max: 25 }),
      )
        .fill(null)
        .map(
          () =>
            new Chance().string({ length: 16, alpha: true, numeric: true }) +
            '.png',
        );

      const fieldName = new Chance().string({
        length: 16,
        alpha: true,
        numeric: true,
      });

      await expectValidationError(fieldName + '.0', 'PHOTO_NOT_FOUND', () =>
        service['validatePhotoNames'](fieldName, fakeProjectId, fakeProtoNames),
      );
    });
  });

  describe('deletePhotos', () => {
    it('Should delete the photos both from the database and from the file system', async () => {
      const project = await service['prisma'].projects.create({
        data: {
          name: new Chance().string({ length: 32 }),
          url: new Chance().url(),
          active: new Chance().bool(),
          photos: {
            createMany: {
              data: Array(new Chance().integer({ min: 5, max: 25 }))
                .fill(null)
                .map(() => ({
                  name: new Chance().string({ length: 32 }) + '.png',
                })),
            },
          },
        },
      });

      const photos = await service['prisma'].projectPhotos.findMany({
        select: {
          name: true,
        },
        where: {
          projectId: project.id,
        },
      });
      const photoNames = photos.map((photo) => photo.name);

      const deleteFileService = jest
        .spyOn(service['fileService'], 'delete')
        .mockReturnValue(undefined);

      await service['deletePhotos'](photoNames);

      expect(deleteFileService).toHaveBeenCalledTimes(photoNames.length);

      const remainingPhotosCount = await service['prisma'].projectPhotos.count({
        where: { projectId: project.id },
      });
      expect(remainingPhotosCount).toEqual(0);
    });
  });

  describe('validateProjectId', () => {
    it('Should not throw when the project exists', async () => {
      const project = await service['prisma'].projects.create({
        data: {
          name: new Chance().string({ length: 32 }),
          url: new Chance().url(),
          active: new Chance().bool(),
        },
      });

      let errors = 0;
      try {
        await service['validateProjectId'](project.id);
      } catch {
        errors++;
      }
      expect(errors).toEqual(0);
    });

    it('Should throw when the project does not exists', async () => {
      const fakeProjectId = new Chance().integer({ min: 1, max: 1000 });

      await expectValidationError('id', 'PROJECT_NOT_FOUND', () =>
        service['validateProjectId'](fakeProjectId),
      );
    });
  });

  describe('update', () => {
    it('Should update the project', async () => {
      const project = await service['prisma'].projects.create({
        data: {
          name: new Chance().string({ length: 32 }),
          url: new Chance().url(),
          active: new Chance().bool(),
        },
      });

      const updates = {
        name: new Chance().string({ length: 32 }),
        url: new Chance().url(),
        active: new Chance().bool(),
        photos: [],
        photosToDelete: [],
      };

      const validateProjectId = jest
        .spyOn(service as any, 'validateProjectId')
        .mockReturnValue({});
      const validatePhotoNames = jest
        .spyOn(service as any, 'validatePhotoNames')
        .mockReturnValue({});
      const deletePhotos = jest
        .spyOn(service as any, 'deletePhotos')
        .mockReturnValue({});
      const uploadPhotos = jest
        .spyOn(service as any, 'uploadPhotos')
        .mockReturnValue({});

      await service.update(project.id, updates);

      expect(validateProjectId).toHaveBeenCalled();
      expect(validatePhotoNames).toHaveBeenCalled();
      expect(deletePhotos).toHaveBeenCalled();
      expect(uploadPhotos).toHaveBeenCalled();

      const updatedProject = await service['prisma'].projects.findFirst({
        where: {
          id: project.id,
        },
      });
      expect(updatedProject).toMatchObject(
        omit(updates, ['photos', 'photosToDelete']),
      );
    });
  });
});
