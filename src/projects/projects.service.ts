import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { FileService } from '../common/files.service';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private fileService: FileService,
  ) {}
}
