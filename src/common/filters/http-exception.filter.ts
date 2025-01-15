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

// import {
//   ArgumentsHost,
//   Catch,
//   ExceptionFilter,
//   HttpException,
//   HttpStatus,
// } from '@nestjs/common';
// import { ValidationError } from 'class-validator';
// import { Response } from 'express';
// import { QueryFailedError } from 'typeorm';

// import { extractValidationErrors } from '../utils/validation-errors.util';

// @Catch()
// export class HttpExceptionFilter implements ExceptionFilter {
//   catch(exception: any, host: ArgumentsHost) {
//     const ctx = host.switchToHttp();
//     const response = ctx.getResponse<Response>();

//     // 1. Handle Validation Errors
//     if (Array.isArray(exception) && exception[0] instanceof ValidationError) {
//       const transformedErrors = extractValidationErrors(exception);
//       return response.status(400).json({
//         success: false,
//         errors: transformedErrors,
//       });
//     }

//     // 2. Handle QueryFailedError (e.g., duplicate key errors)
//     if (exception instanceof QueryFailedError) {
//       // Customize the message or status code as needed
//       const errorDetail = exception.driverError?.detail || exception.message;

//       return response.status(HttpStatus.BAD_REQUEST).json({
//         success: false,
//         message: errorDetail,
//         // detail: errorDetail,
//       });
//     }

//     // 3. Handle AWS-Specific Errors by checking for `exception.code`
//     //    Example: AccessControlListNotSupported
//     if (exception && exception.code) {
//       // If it's "AccessControlListNotSupported"
//       if (exception.code === 'AccessControlListNotSupported') {
//         // The bucket does not allow ACLs.
//         // Must remove `acl` in your upload or enable ACLs in your S3 bucket.
//         return response.status(400).json({
//           success: false,
//           message:
//             'The bucket does not allow ACLs. Remove "acl" from your S3 upload or enable ACLs in your bucket settings.',
//         });
//       }
//       // Add other AWS error codes here, if desired
//       // else if (exception.code === 'AnotherAwsErrorCode') {
//       //   ...
//       // }

//       // If it’s an unrecognized AWS error code, handle gracefully:
//       return response.status(exception.statusCode || 500).json({
//         success: false,
//         message: exception.message || 'AWS error occurred',
//       });
//     }

//     // 4. Handle standard HttpException Errors
//     if (exception instanceof HttpException) {
//       const exceptionResponse = exception.getResponse();
//       const statusCode = exception.getStatus();

//       let message: string;
//       if (typeof exceptionResponse === 'string') {
//         message = exceptionResponse;
//       } else if (
//         typeof exceptionResponse === 'object' &&
//         (exceptionResponse as any).message
//       ) {
//         message = Array.isArray((exceptionResponse as any).message)
//           ? (exceptionResponse as any).message.join(', ')
//           : (exceptionResponse as any).message;
//       } else {
//         message = 'An unexpected error occurred';
//       }

//       return response.status(statusCode).json({
//         success: false,
//         message,
//       });
//     }

//     // 5. Handle Other Exceptions
//     return response.status(500).json({
//       success: false,
//       message: 'Internal server error',
//     });
//   }
// }
