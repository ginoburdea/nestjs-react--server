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
  UseInterceptors,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  CreateProjectBody,
  CreateProjectBodySwagger,
  CreateProjectResponse,
} from './dto/create.dto';
import { GetProjectsQuery, GetProjectsResponse } from './dto/get.dto';
import {
  GetProjectByIdParams,
  GetProjectByIdResponse,
} from './dto/get-by-id.dto';
import {
  UpdateProjectBody,
  UpdateProjectBodySwagger,
  UpdateProjectParams,
} from './dto/update.dto';
import {
  ApiBody,
  ApiConsumes,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiCommonResponses } from '../common/api-common-responses';
import { RequiresAuth } from '../common/requires-auth';

@ApiTags('Proiecte')
@Controller()
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @ApiBody({
    type: CreateProjectBodySwagger,
  })
  @ApiOkResponse({
    description: 'Proiect creat cu succes',
    type: CreateProjectResponse,
  })
  @ApiConsumes('multipart/form-data')
  @ApiCommonResponses()
  @RequiresAuth()
  @HttpCode(200)
  @Post('/projects')
  @UseInterceptors(FilesInterceptor('photos'))
  async createProject(
    @Body() body: CreateProjectBody,
    @UploadedFiles() photos?: Express.Multer.File[],
  ) {
    const project = await this.projectsService.createProject({
      ...body,
      photos: (photos || []).map((photo) => ({
        content: photo.buffer,
        mimeType: photo.mimetype,
      })),
    });

    return { id: project.id };
  }

  @ApiOkResponse({
    description: 'Proiecte interogate cu succes',
    type: GetProjectsResponse,
  })
  @ApiCommonResponses()
  @RequiresAuth()
  @Get('/projects/all')
  async getProjects(@Query() query: GetProjectsQuery) {
    const { results, meta } = await this.projectsService.getProjects(
      query,
      false,
    );
    return { results, meta };
  }

  @ApiOkResponse({
    description: 'Proiecte interogate cu succes',
    type: GetProjectsResponse,
  })
  @ApiCommonResponses()
  @Get('/public/projects/all')
  async getPublicProjects(@Query() query: GetProjectsQuery) {
    const { results, meta } = await this.projectsService.getProjects(
      query,
      true,
    );
    return { results, meta };
  }

  @ApiOkResponse({
    description: 'Proiect interogat cu succes',
    type: GetProjectByIdResponse,
  })
  @ApiCommonResponses()
  @RequiresAuth()
  @Get('/projects/:id')
  async getProjectById(@Param() params: GetProjectByIdParams) {
    const project = await this.projectsService.getProjectInfo(params.id, false);
    return { project };
  }

  @ApiOkResponse({
    description: 'Proiect interogat cu succes',
    type: GetProjectByIdResponse,
  })
  @ApiCommonResponses()
  @Get('/public/projects/:id')
  async getPublicProjectById(@Param() params: GetProjectByIdParams) {
    const project = await this.projectsService.getProjectInfo(params.id, true);
    return { project };
  }

  @ApiBody({
    type: UpdateProjectBodySwagger,
  })
  @ApiNoContentResponse({
    description: 'Proiect actulizat cu succes',
  })
  @ApiConsumes('multipart/form-data')
  @ApiCommonResponses()
  @RequiresAuth()
  @HttpCode(204)
  @Patch('/projects/:id')
  @UseInterceptors(FilesInterceptor('photos'))
  async updateProject(
    @Param() params: UpdateProjectParams,
    @Body() body: UpdateProjectBody,
    @UploadedFiles() photos?: Express.Multer.File[],
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
