import { Module } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { UsersService } from '../users/users.service';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

@Module({
  controllers: [ProjectsController],
  providers: [PrismaService, UsersService, ProjectsService],
})
export class ProjectsModule {}
