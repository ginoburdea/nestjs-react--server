import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ValidationPipe } from '@nestjs/common';
import { CustomExceptionFilter } from '../common/custom-exception.filter';
import { validationPipeConfig } from '../config/validationPipe';

export const loadApp = async () => {
  const server = await NestFactory.create(AppModule);

  server.useGlobalPipes(new ValidationPipe(validationPipeConfig));
  server.useGlobalFilters(new CustomExceptionFilter());
  server.enableCors({
    origin: process.env.CORS_ORIGINS,
    credentials: process.env.NODE_ENV !== 'production',
  });

  return server;
};
