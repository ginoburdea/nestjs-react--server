import { Test, TestingModule } from '@nestjs/testing';
import { LocalFileService } from './files.service';
import { Chance } from 'chance';
import { exists, readFileSync } from 'fs-extra';
import { resolve } from 'path';

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
      const name = new Chance().string({ length: 16 }) + '.png';

      await service.upload(file, name, 'image/png');

      const fileExists = await exists(resolve('.temp/uploads', name));
      expect(fileExists).toEqual(true);
    });
  });
});
