export abstract class FileService {
  async upload(file: Buffer, name: string, mimeType: string) {}
}

export class LocalFileService implements FileService {
  async upload(file: Buffer, name: string, mimeType: string) {
    // TODO: implement this function
  }
}

export class S3FileService implements FileService {
  async upload(file: Buffer, name: string, mimeType: string) {
    // TODO: implement this function
  }
}
