import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ValidationPipe } from '@nestjs/common';
import { CustomExceptionFilter } from '../common/custom-exception.filter';
import { validationPipeConfig } from '../config/validationPipe';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { TranslationService } from '../common/translation.service';

export const loadApp = async () => {
  const server = await NestFactory.create(AppModule);

  if (process.env.NODE_ENV !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('NestJS React - Domentatie API')
      .setVersion('1.0')
      .addCookieAuth('access_token')
      .build();
    const swaggerDocumentFactory = () =>
      SwaggerModule.createDocument(server, swaggerConfig);
    SwaggerModule.setup('docs', server, swaggerDocumentFactory);
  }

  server.useGlobalPipes(new ValidationPipe(validationPipeConfig));

  const translationService = server.get(TranslationService);
  server.useGlobalFilters(new CustomExceptionFilter(translationService));

  server.use(cookieParser());
  server.enableCors({
    origin: process.env.CORS_ORIGINS.split(','),
    credentials: process.env.NODE_ENV !== 'production',
  });

  return server;
};
