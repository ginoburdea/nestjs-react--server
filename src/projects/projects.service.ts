import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { FileService } from '../common/files.service';
import { CreateProjectBody } from './dto/create.dto';
import { randomUUID } from 'crypto';

interface File {
  content: Buffer;
  mimeType: string;
}

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private fileService: FileService,
  ) {}

  private async uploadPhotos(projectId: number, photos: File[]) {
    const photosWithNames = photos.map((photo) => ({
      ...photo,
      name: randomUUID() + '.' + photo.mimeType.split('/')[1],
    }));

    for (const photo of photosWithNames) {
      await this.fileService.upload(photo.content, photo.name, photo.mimeType);
    }

    const photosInDb = await this.prisma.projectPhotos.createMany({
      data: photosWithNames.map((photo) => ({ projectId, name: photo.name })),
    });

    return photosInDb;
  }

  async createProject(data: CreateProjectBody & { photos: File[] }) {
    const project = await this.prisma.projects.create({
      data: {
        name: data.name,
        url: data.url,
        description: data.description,
        active: data.active,
      },
    });

    await this.uploadPhotos(project.id, data.photos);

    return project;
  }
}
