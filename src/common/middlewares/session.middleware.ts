import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
		console.log('Raw Cookie Header:', req.headers.cookie); // Check if header exists
    console.log('Parsed Cookies:', req.cookies);
    let sessionId = req.cookies?.session_id;
    console.log('🚀 ~ :9 ~ SessionMiddleware ~ use ~ sessionId:', sessionId);

    if (!sessionId) {
      sessionId = randomUUID();

      res.cookie('session_id', sessionId, {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 60 * 1000,
      });

    }

    // Attach to request object
    req.sessionId = sessionId;

    next();
  }
}
