import {
  ExceptionFilter,
  NestInterceptor,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.transform';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set global prefix
  app.setGlobalPrefix('api');

  // remove header x-powered-by
  app.use((_, res, next) => {
    res.removeHeader('X-Powered-By');
    next();
  });

  // cookie parser
  // app.use(cookieParser());

  // helmet
  app.use(helmet());

  // cors
  app.enableCors({
    // origin: [process.env.DEV_CLIENT_URL, process.env.PROD_CLIENT_URL],
    origin: true,
    credentials: true,
  });

  // swagger docs
  const options = new DocumentBuilder()
    .setTitle('FB Integration API')
    .setDescription('The FB Integration API description')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token **_only_**',
        in: 'header',
      },
      'access_token', // This name should match the name in @ApiBearerAuth() decorator in your controller
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
    jsonDocumentUrl: 'api/json',
  });

  // Global Pipe for validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory(errors) {
        return errors;
      },
    }),
  );

  // Global Interceptor for success responses
  const interceptors: NestInterceptor[] = [new ResponseTransformInterceptor()];
  app.useGlobalInterceptors(...interceptors);

  // Global Exception Filter for error responses
  const filters: ExceptionFilter[] = [new HttpExceptionFilter()];
  app.useGlobalFilters(...filters);

  await app.listen(process.env.HTTP_SERVER_PORT || 8000);
}

bootstrap();
