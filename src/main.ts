import {
  ExceptionFilter,
  NestInterceptor,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import helmet from 'helmet';
import { join } from 'path';

import { AppModule } from './app.module';
import CONSTANTS from './common/constants';
import { AllExceptionFilter } from './common/filters/all-exception.filter';
import { AuthExceptionFilter } from './common/filters/auth-exceptions.filter';
import { QueryFailedExceptionFilter } from './common/filters/db-exception.filter';
import { FBExceptionFilter } from './common/filters/fb-exception.filter';
import { ValidationExceptionFilter } from './common/filters/validation-exception.filter';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.transform';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Remove COOP header to fix Swagger UI issues
  app.use((_req, res, next) => {
    res.removeHeader('Cross-Origin-Opener-Policy');
    next();
  });

  // remove header x-powered-by
  app.use((_, res, next) => {
    res.removeHeader('X-Powered-By');
    next();
  });

  // helmet
  app.use(
    helmet({
      contentSecurityPolicy: false, // Disable CSP for Swagger UI
      crossOriginEmbedderPolicy: false, // Required for Swagger UI
      crossOriginResourcePolicy: false, // Allow cross-origin resource loading
    }),
  );

  // cors
  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
  });

  // serve static files with cross-origin headers
  app.use(
    '/uploads',
    (req, res, next) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      next();
    },
    express.static(join(process.cwd(), 'uploads')),
  );

  // swagger docs
  const options = new DocumentBuilder()
    .setTitle('Tijaratk API')
    .setDescription('Tijaratk API documentation')
    .setVersion('1.0')
    .setExternalDoc('API Documentation', '/docs')
    .setContact('Tijaratk', 'https://tijaratk.com', 'info@tijaratk.com')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token **_only_**',
        in: 'header',
      },
      CONSTANTS.ACCESS_TOKEN, // This name should match the name in @ApiBearerAuth() decorator in your controller
    );

  if (process.env.NODE_ENV === 'development') {
    options.addServer(process.env.APP_URL, 'Local environment');
  } else {
    options.addServer(process.env.APP_URL, 'Production environment');
  }

  const config = options.build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document, {
    jsonDocumentUrl: 'json',
  });

  // Global Pipe for validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory(errors) {
        return errors;
      },
    }),
  );

  // Global Interceptor for success responses
  const interceptors: NestInterceptor[] = [new ResponseTransformInterceptor()];
  app.useGlobalInterceptors(...interceptors);

  // Global Exception Filter for error responses
  const filters: ExceptionFilter[] = [
    new ValidationExceptionFilter(),
    new FBExceptionFilter(),
    new AuthExceptionFilter(),
    new QueryFailedExceptionFilter(),
    new AllExceptionFilter(),
  ];
  app.useGlobalFilters(...filters);

  await app.listen(process.env.HTTP_SERVER_PORT, '127.0.0.1');
}

bootstrap();
