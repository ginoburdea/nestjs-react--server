import {
  Body,
  Controller,
  HttpCode,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateProjectBody } from './dto/create.dto';
import { AuthGuard } from '../common/auth.guard';

@Controller('projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Post('')
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
}
