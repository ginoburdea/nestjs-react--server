import { Module } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { UsersService } from '../users/users.service';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import {
  FileService,
  LocalFileService,
  S3FileService,
} from '../common/files.service';

@Module({
  controllers: [ProjectsController],
  providers: [
    PrismaService,
    UsersService,
    ProjectsService,
    {
      provide: FileService,
      useClass:
        process.env.NODE_ENV === 'production'
          ? S3FileService
          : LocalFileService,
    },
  ],
})
export class ProjectsModule {}
