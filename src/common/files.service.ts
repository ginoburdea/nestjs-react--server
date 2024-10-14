import { ensureDir, writeFile } from 'fs-extra';
import { join, resolve } from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

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
  private s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      endpoint: process.env.S3_ENDPOINT,
      region: process.env.S3_REGION,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      },
    });
  }

  async upload(file: Buffer, name: string, mimeType: string) {
    const uploadFileCommand = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Body: file,
      ContentType: mimeType,
      Key: name,
    });

    await this.s3Client.send(uploadFileCommand);
  }
}
