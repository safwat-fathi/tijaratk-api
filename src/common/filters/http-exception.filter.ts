// // src/common/filters/http-exception.filter.ts
// import {
//   ExceptionFilter,
//   Catch,
//   ArgumentsHost,
//   HttpException,
// } from '@nestjs/common';

// @Catch(HttpException)
// export class HttpExceptionFilter implements ExceptionFilter {
//   catch(exception: HttpException, host: ArgumentsHost) {
//     const ctx = host.switchToHttp();
//     const response = ctx.getResponse();
//     const statusCode = exception.getStatus();
//     const exceptionResponse: any = exception.getResponse();
//     console.log(
//       '🚀 ~ HttpExceptionFilter ~ exceptionResponse:',
//       exceptionResponse,
//     );

//     let errors = [];

//     // `exceptionResponse.message` may be a string or an array
//     if (exceptionResponse && exceptionResponse.message) {
//       errors = Array.isArray(exceptionResponse.message)
//         ? exceptionResponse.message
//         : [exceptionResponse.message];
//     } else {
//       // If no explicit message, fallback to a generic error
//       errors = ['An error occurred'];
//     }

//     response.status(statusCode).json({
//       status: false,
//       message: this.getMessageFromStatus(statusCode),
//       errors,
//     });
//   }

//   private getMessageFromStatus(status: number): string {
//     // You can customize messages based on the status code
//     if (status >= HttpStatus.OK && status < 300) {
//       return 'Success';
//     } else if (status >= 400 && status < 500) {
//       return 'Client error';
//     } else if (status >= 500) {
//       return 'Server error';
//     }

//     return 'Ok';
//   }
// }
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    console.log("🚀 ~ HttpExceptionFilter ~ exception:", exception)
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Handle Validation Errors
    if (Array.isArray(exception) && exception[0] instanceof ValidationError) {
      const transformedErrors = exception.map((err: ValidationError) => ({
        property: err.property,
        messages: Object.values(err.constraints || {}),
      }));

      return response.status(400).json({
        success: false,
        errors: transformedErrors,
      });
    }

    // Handle HttpException Errors
    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      const statusCode = exception.getStatus();

      // Extract message based on the type of exceptionResponse
      let message: string;

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        (exceptionResponse as any).message
      ) {
        message = (exceptionResponse as any).message;
      } else {
        message = 'An unexpected error occurred';
      }

      return response.status(statusCode).json({
        success: false,
        message,
      });
    }

    // Handle Other Exceptions
    return response.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}
