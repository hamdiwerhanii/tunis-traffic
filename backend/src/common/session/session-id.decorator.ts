import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import type { Request } from 'express';

export const SessionId = createParamDecorator((_data: unknown, context: ExecutionContext) => {
  const { sessionId } = context.switchToHttp().getRequest<Request>();
  if (!sessionId) throw new InternalServerErrorException('Session is not initialised');
  return sessionId;
});
