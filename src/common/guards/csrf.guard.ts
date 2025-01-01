// import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
// import { doubleCsrf } from 'csrf-csrf';
// import { Request, Response } from 'express';
// import { doubleCsrfOptions } from 'src/config/csrf.config';

// @Injectable()
// export class CsrfGuard implements CanActivate {
//   canActivate(context: ExecutionContext): Promise<boolean> | boolean {
//     const req: Request = context.switchToHttp().getRequest();
//     const res: Response = context.switchToHttp().getResponse();

//     let isAllowed = true;

//     const {
//       doubleCsrfProtection, // This is the default CSRF protection middleware.
//     } = doubleCsrf(doubleCsrfOptions);

//     doubleCsrfProtection(req, res, (err) => {
//       if (err) {
//         isAllowed = false;
//       }
//     });

//     return isAllowed;
//   }
// }
