import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    if (
      exception instanceof TypeError ||
      exception instanceof RangeError ||
      exception instanceof ReferenceError ||
      exception instanceof SyntaxError ||
      exception instanceof EvalError
    ) {
      this.logger.error(exception);

      return host
        .switchToHttp()
        .getResponse()
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({
          success: false,
          message: 'Internal server error',
        });
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Check if the exception is a validation error
    if (exception[0] instanceof ValidationError) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: `Validation error for ${(exception[0] as ValidationError).property} - ${Object.values((exception[0] as ValidationError).constraints)?.join(', ')}`,
        timestamp: new Date().toISOString(),
        path: request.url, // Optional: include request path
      });
    }

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
      this.logger.error('Unexpected error', exception as any);
    }

    return response.status(statusCode).json({
      success: false,
      message,
      errors: (exceptionResponse as any).error || null,
      timestamp: new Date().toISOString(),
      path: request.url, // Optional: include request path
    });
  }
}
