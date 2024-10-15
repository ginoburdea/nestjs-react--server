import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { FileService } from '../common/files.service';
import { CreateProjectBody } from './dto/create.dto';
import { randomUUID } from 'crypto';
import { GetProjectsQuery } from './dto/get.dto';

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

  private genPaginationMeta(
    currentPage: number,
    pageSize: number,
    totalRows: number,
  ) {
    const firstPage = 1;
    const lastPage = Math.max(Math.ceil(totalRows / pageSize), firstPage);
    const prevPage =
      currentPage > firstPage ? Math.max(currentPage - 1, firstPage) : null;
    const nextPage = currentPage < lastPage ? currentPage + 1 : null;

    return { firstPage, lastPage, pageSize, prevPage, nextPage, currentPage };
  }

  private async getSimplifiedProjects(
    pageSize: number,
    filters: GetProjectsQuery,
  ) {
    const projects = await this.prisma.projects.findMany({
      take: pageSize,
      skip: pageSize * (filters.page - 1),
      select: {
        id: true,
        active: true,
        name: true,
        photos: {
          select: {
            name: true,
          },
          take: 1,
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: filters.order === 'oldest' ? 'asc' : 'desc',
      },
    });

    const formattedProjects = projects.map((project) => ({
      ...project,
      photos: undefined,
      photo: project.photos[0]?.name || null,
    }));

    return formattedProjects;
  }

  async getProjects(filters: GetProjectsQuery) {
    const pageSize = 25;

    const projectsCount = await this.prisma.projects.count();
    const meta = this.genPaginationMeta(filters.page, pageSize, projectsCount);
    const projects = await this.getSimplifiedProjects(pageSize, filters);

    return { results: projects, meta };
  }
}
