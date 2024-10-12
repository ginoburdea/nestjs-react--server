import { ensureDir, writeFile } from 'fs-extra';
import { join, resolve } from 'path';

export abstract class FileService {
  async upload(file: Buffer, name: string, mimeType: string) {}
}

export class LocalFileService implements FileService {
  async upload(file: Buffer, name: string, mimeType: string) {
    const folderPath = resolve('.temp/uploads');
    await ensureDir(folderPath);

    const filePath = join(folderPath, name);
    await writeFile(filePath, file);
  }
}

export class S3FileService implements FileService {
  async upload(file: Buffer, name: string, mimeType: string) {
    // TODO: implement this function
  }
}
