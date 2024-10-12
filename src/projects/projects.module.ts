import { Module } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { UsersService } from '../users/users.service';

@Module({
  controllers: [],
  providers: [PrismaService, UsersService],
})
export class ProjectsModule {}
