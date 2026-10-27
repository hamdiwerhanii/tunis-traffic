import { randomUUID } from 'node:crypto';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { isUUID } from 'class-validator';
import type { NextFunction, Request, Response } from 'express';
import { AppConfigService } from '../../config/app-config.service.js';

export const SESSION_COOKIE = 'tt_session';
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  constructor(private readonly config: AppConfigService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const current: unknown = req.cookies?.[SESSION_COOKIE];

    if (typeof current === 'string' && isUUID(current, 4)) {
      req.sessionId = current;
    } else {
      req.sessionId = randomUUID();
      res.cookie(SESSION_COOKIE, req.sessionId, {
        httpOnly: true,
        sameSite: 'lax',
        secure: this.config.isProduction,
        maxAge: ONE_YEAR_MS,
        path: '/',
      });
    }

    next();
  }
}
