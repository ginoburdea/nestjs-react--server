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
import { CreateProjectBody, CreateProjectResponse } from './dto/create.dto';
import { AuthGuard } from '../common/auth.guard';
import { GetProjectsQuery, GetProjectsResponse } from './dto/get.dto';
import {
  GetProjectByIdParams,
  GetProjectByIdResponse,
} from './dto/get-by-id.dto';
import { UpdateProjectBody, UpdateProjectParams } from './dto/update.dto';
import {
  ApiConsumes,
  ApiCookieAuth,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiCommonResponses } from 'src/common/api-common-responses';

@ApiTags('Proiecte')
@Controller()
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @ApiOkResponse({
    description: 'Proiect creat cu succes',
    type: CreateProjectResponse,
  })
  @ApiConsumes('multipart/form-data')
  @ApiCommonResponses()
  @ApiCookieAuth()
  @HttpCode(200)
  @Post('/projects')
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

  @ApiOkResponse({
    description: 'Proiecte interogate cu succes',
    type: GetProjectsResponse,
  })
  @ApiCommonResponses()
  @ApiCookieAuth()
  @Get('/projects/all')
  @UseGuards(AuthGuard)
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
  @ApiCookieAuth()
  @Get('/projects/:id')
  @UseGuards(AuthGuard)
  async getProjectById(@Param() params: GetProjectByIdParams) {
    const project = await this.projectsService.getProjectInfo(params.id);
    return { project };
  }

  @HttpCode(204)
  @Patch('/projects/:id')
  @UseGuards(AuthGuard)
  @ApiCookieAuth()
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
