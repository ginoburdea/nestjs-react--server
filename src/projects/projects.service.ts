import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { FileService } from '../common/files.service';
import { CreateProjectBody } from './dto/create.dto';
import { randomUUID } from 'crypto';
import { GetProjectsQuery } from './dto/get.dto';
import { ValidationException } from '../common/validation.exception';
import { merge, omit, pick } from 'remeda';
import { UpdateProjectBody } from './dto/update.dto';

interface File {
  content: Buffer;
  mimeType: string;
}

interface UpdateProjectData extends UpdateProjectBody {
  /** Photos to upload */
  photos: File[];
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

  private getPhotoUrl = (photoName: string) => {
    if (process.env.NODE_ENV === 'production') {
      return process.env.S3_PUBLIC_URL + '/' + photoName;
    }
    return `http://localhost:3000/uploads/${photoName}`;
  };

  private async getSimplifiedProjects(
    pageSize: number,
    filters: GetProjectsQuery,
    prismaFilters: {} | { active: true },
  ) {
    const projects = await this.prisma.projects.findMany({
      take: pageSize,
      where: prismaFilters,
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
      ...omit(project, ['photos']),
      photo: project.photos[0]?.name
        ? this.getPhotoUrl(project.photos[0].name)
        : null,
    }));

    return formattedProjects;
  }

  async getProjects(filters: GetProjectsQuery, mustBeActive: boolean) {
    const pageSize = 25;

    const prismaFilters = mustBeActive ? { active: true } : {};
    const projectsCount = await this.prisma.projects.count({
      where: prismaFilters,
    });
    const meta = this.genPaginationMeta(filters.page, pageSize, projectsCount);
    const projects = await this.getSimplifiedProjects(
      pageSize,
      filters,
      prismaFilters,
    );

    return { results: projects, meta };
  }

  async getProjectInfo(id: number, mustBeActive: boolean) {
    const project = await this.prisma.projects.findFirst({
      where: {
        id,
        active: mustBeActive ? true : undefined,
      },
      include: {
        photos: {
          take: 25,
          select: {
            name: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!project) throw ValidationException.fromCode('PROJECT_NOT_FOUND', 'id');

    const formattedProject = {
      ...pick(project, ['id', 'name', 'url', 'description', 'active']),
      photos: project.photos.map((photo) => ({
        name: photo.name,
        url: this.getPhotoUrl(photo.name),
      })),
    };

    return formattedProject;
  }

  private async validatePhotoNames(
    fieldName: string,
    projectId: number,
    photoNames: string[],
  ) {
    const existingPhotos = await this.prisma.projectPhotos.findMany({
      select: {
        name: true,
      },
      where: {
        projectId,
        name: {
          in: photoNames,
        },
      },
    });
    const existingPhotosArray = existingPhotos.map((photo) => photo.name);

    for (let i = 0; i < photoNames.length; i++) {
      if (!existingPhotosArray.includes(photoNames[i])) {
        throw ValidationException.fromCode(
          'PHOTO_NOT_FOUND',
          `${fieldName}.${i}`,
        );
      }
    }
  }

  private async deletePhotos(photoNames: string[]) {
    for (const name of photoNames) await this.fileService.delete(name);

    await this.prisma.projectPhotos.deleteMany({
      where: {
        name: {
          in: photoNames,
        },
      },
    });
  }

  private async validateProjectId(id: number) {
    const projectExists = await this.prisma.projects.findFirst({
      where: { id },
      select: { id: true },
    });

    if (!projectExists) {
      throw ValidationException.fromCode('PROJECT_NOT_FOUND', 'id');
    }
  }

  async update(id: number, updates: UpdateProjectData) {
    await this.validateProjectId(id);
    await this.validatePhotoNames(
      'photosToDelete',
      id,
      updates.photosToDelete || [],
    );

    await this.deletePhotos(updates.photosToDelete || []);
    await this.uploadPhotos(id, updates.photos || []);

    await this.prisma.projects.update({
      where: { id },
      data: pick(updates, ['name', 'url', 'description', 'active']),
    });
  }
}
