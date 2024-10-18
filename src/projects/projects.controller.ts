import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateProjectBody } from './dto/create.dto';
import { AuthGuard } from '../common/auth.guard';
import { GetProjectsQuery } from './dto/get.dto';
import { GetProjectByIdParams } from './dto/get-by-id.dto';
import { UpdateProjectBody, UpdateProjectParams } from './dto/update.dto';

@Controller()
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Post('/projects')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @UseInterceptors(FilesInterceptor('photos'))
  async createProject(
    @UploadedFiles() photos: Express.Multer.File[],
    @Body() body: CreateProjectBody,
  ) {
    const project = await this.projectsService.createProject({
      ...body,
      photos: photos.map((photo) => ({
        content: photo.buffer,
        mimeType: photo.mimetype,
      })),
    });

    return { id: project.id };
  }

  @Get('/projects/all')
  @UseGuards(AuthGuard)
  async getProjects(@Query() query: GetProjectsQuery) {
    const { results, meta } = await this.projectsService.getProjects(
      query,
      false,
    );
    return { results, meta };
  }

  @Get('/public/projects/all')
  async getPublicProjects(@Query() query: GetProjectsQuery) {
    const { results, meta } = await this.projectsService.getProjects(
      query,
      true,
    );
    return { results, meta };
  }

  @Get('/projects/:id')
  @UseGuards(AuthGuard)
  async getProjectById(@Param() params: GetProjectByIdParams) {
    const project = await this.projectsService.getProjectInfo(params.id);
    return { project };
  }

  @Patch('/projects/:id')
  @UseGuards(AuthGuard)
  @UseInterceptors(FilesInterceptor('photos'))
  async updateProject(
    @Param() params: UpdateProjectParams,
    @Body() body: UpdateProjectBody,
    @UploadedFiles() photos: Express.Multer.File[],
  ) {
    await this.projectsService.update(params.id, {
      ...body,
      photos: (photos || []).map((photo) => ({
        content: photo.buffer,
        mimeType: photo.mimetype,
      })),
    });
  }
}
