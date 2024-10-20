import { Test, TestingModule } from '@nestjs/testing';
import { LocalFileService, S3FileService } from './files.service';
import { Chance } from 'chance';
import { exists, readFileSync } from 'fs-extra';
import { resolve } from 'path';
import { HeadObjectCommand, NotFound } from '@aws-sdk/client-s3';

describe('LocalFileService', () => {
  let service: LocalFileService;

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [LocalFileService],
    }).compile();

    service = module.get<LocalFileService>(LocalFileService);
  });

  describe('upload', () => {
    it('Should upload a file to disk', async () => {
      const file = readFileSync(resolve('test/data/photo.png'));
      const name =
        new Chance().string({ alpha: true, numeric: true, length: 16 }) +
        '.png';

      await service.upload(file, name, 'image/png');

      const fileExists = await exists(resolve('.temp/uploads', name));
      expect(fileExists).toEqual(true);
    });
  });

  describe('delete', () => {
    it('Should delete an existing file', async () => {
      const file = readFileSync(resolve('test/data/photo.png'));
      const name =
        new Chance().string({ alpha: true, numeric: true, length: 16 }) +
        '.png';
      await service.upload(file, name, 'image/png');

      await service.delete(name);

      const fileExists = await exists(resolve('.temp/uploads', name));
      expect(fileExists).toEqual(false);
    });

    it('Should not do anything if the file does not exist', async () => {
      const fakeName =
        new Chance().string({ alpha: true, numeric: true, length: 16 }) +
        '.png';

      await service.delete(fakeName);
    });
  });
});

describe('S3FileService', () => {
  let service: S3FileService;

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [S3FileService],
    }).compile();

    service = module.get<S3FileService>(S3FileService);
  });

  describe('upload', () => {
    it('Should upload a file to S3', async () => {
      const file = readFileSync(resolve('test/data/photo.png'));
      const name =
        new Chance().string({ alpha: true, numeric: true, length: 16 }) +
        '.png';

      await service.upload(file, name, 'image/png');

      const getObjectCommand = new HeadObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: name,
      });
      // If the file does not exist, this will throw an error and the test will fail
      await service['s3Client'].send(getObjectCommand);
    });
  });

  describe('delete', () => {
    it('Should delete an existing file', async () => {
      const file = readFileSync(resolve('test/data/photo.png'));
      const name =
        new Chance().string({ alpha: true, numeric: true, length: 16 }) +
        '.png';
      await service.upload(file, name, 'image/png');

      await service.delete(name);

      const fileExistsCommand = new HeadObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: name,
      });

      let errors = 0;
      try {
        // If the file does not exist, this will throw an error
        await service['s3Client'].send(fileExistsCommand);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFound);
        errors++;
      }
      expect(errors).toEqual(1);
    });

    it('Should not do anything if the file does not exist', async () => {
      const fakeName =
        new Chance().string({ alpha: true, numeric: true, length: 16 }) +
        '.png';

      await service.delete(fakeName);
    });
  });
});
