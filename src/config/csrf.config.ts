// import { DoubleCsrfConfigOptions } from 'csrf-csrf';

// // csrf
// export const doubleCsrfOptions: DoubleCsrfConfigOptions = {
//   cookieName: 'x-csrf-token',
//   getSecret: () => process.env.CSRF_SECRET,
//   getSessionIdentifier(req) {
//     return req.headers['x-csrf-token'];
//   },
//   cookieOptions: {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === 'production',
//     sameSite: 'none',
//   },
//   ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
//   getTokenFromRequest: (req) => req.headers['x-csrf-token'],
// };
