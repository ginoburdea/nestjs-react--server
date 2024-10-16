import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { resolve } from 'path';

@Module({
  imports: [
    UsersModule,
    ProjectsModule,
    process.env.NODE_ENV === 'development'
      ? ServeStaticModule.forRoot({
          rootPath: resolve('.temp/uploads'),
          serveRoot: '/uploads',
        })
      : null,
  ].filter((mod) => mod),
  controllers: [],
})
export class AppModule {}
