import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    let sessionId = req.cookies?.session_id;

    if (!sessionId) {
      sessionId = randomUUID();

      res.cookie('session_id', sessionId, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 30 * 60 * 1000, // 30 minutes
      });
    }

    // Attach to request object
    (req as any).sessionId = sessionId;

    next();
  }
}
