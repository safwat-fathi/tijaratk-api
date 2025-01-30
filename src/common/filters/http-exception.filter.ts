import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const exceptionResponse = exception.getResponse();
    const statusCode = exception.getStatus();

    let message: string;
    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (
      typeof exceptionResponse === 'object' &&
      (exceptionResponse as any).message
    ) {
      message = Array.isArray((exceptionResponse as any).message)
        ? (exceptionResponse as any).message.join(', ')
        : (exceptionResponse as any).message;
    } else {
      message = 'An unexpected error occurred';
    }

    return response.status(statusCode).json({
      success: false,
      message,
    });
  }
}
