import {
  ExceptionFilter,
  INestApplication,
  NestInterceptor,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import session from 'express-session';
import { readFileSync } from 'fs';
import helmet from 'helmet';
import path from 'path';

import { AppModule } from './app.module';
import CONSTANTS from './common/constants';
import { AllExceptionFilter } from './common/filters/all-exception.filter';
import { QueryFailedExceptionFilter } from './common/filters/db-exception.filter';
import { FBExceptionFilter } from './common/filters/fb-exception.filter';
import { ValidationExceptionFilter } from './common/filters/validation-exception.filter';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.transform';

async function bootstrap() {
  const isDev = process.env.NODE_ENV !== 'production';
  let app: INestApplication;

  if (isDev) {
    // Only load HTTPS options in development.
    const httpsOptions = {
      key: readFileSync(path.join(__dirname, '../localhost-key.pem')), // adjust path if needed
      cert: readFileSync(path.join(__dirname, '../localhost.pem')), // adjust path if needed
    };
    app = await NestFactory.create(AppModule, { httpsOptions });
  } else {
    // In production, HTTPS termination is often handled by a proxy or load balancer.
    app = await NestFactory.create(AppModule);
  }

  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: { secure: true, httpOnly: true, sameSite: 'none' },
    }),
  );

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
    }),
  );

  // cors
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: false,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // swagger docs
  const options = new DocumentBuilder()
    .setTitle('Tijaratk API')
    .setDescription('The Tijaratk API description')
    .setVersion('0.1')
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
    options.addServer(process.env.DEV_APP_URL, 'Local environment');
  } else {
    options.addServer(
      process.env.PROD_APP_URL,
      'Live environment (production)',
    );
  }

  // if (process.env.NODE_ENV === 'development') {
  // 	options.addBearerAuth();
  // } else {
  // 	options.addBasicAuth();
  // }

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
    new AllExceptionFilter(),
    new QueryFailedExceptionFilter(),
    new FBExceptionFilter(),
  ];
  app.useGlobalFilters(...filters);

  await app.listen(process.env.HTTP_SERVER_PORT);
}

bootstrap();
