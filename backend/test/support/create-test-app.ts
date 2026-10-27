import { randomUUID } from 'node:crypto';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { getConnectionToken } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';
import request from 'supertest';
import { inject } from 'vitest';

export type TestApp = {
  app: NestExpressApplication;
  agent: () => ReturnType<typeof request.agent>;
  http: () => ReturnType<typeof request>;
  resetDatabase: () => Promise<void>;
  close: () => Promise<void>;
};

export async function createTestApp(env: Record<string, string> = {}): Promise<TestApp> {
  const baseUri = inject('mongoUri');

  Object.assign(process.env, {
    NODE_ENV: 'test',
    MONGODB_URI: `${baseUri.replace(/\/$/, '')}/test-${randomUUID()}`,
    SWAGGER_ENABLED: 'false',
    ...env,
  });

  const { AppModule } = await import('../../src/app.module.js');
  const { configureApp } = await import('../../src/app.setup.js');

  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = moduleRef.createNestApplication<NestExpressApplication>({ logger: false });
  configureApp(app);
  await app.init();

  const connection = app.get<Connection>(getConnectionToken());
  const server = app.getHttpServer();

  return {
    app,
    agent: () => request.agent(server),
    http: () => request(server),
    resetDatabase: async () => {
      await Promise.all(
        Object.values(connection.collections).map((collection) => collection.deleteMany({})),
      );
    },
    close: async () => {
      await connection.dropDatabase();
      await app.close();
    },
  };
}

export const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export const AIRPORT = { name: 'Tunis-Carthage Airport', lat: 36.851, lng: 10.2272 };
export const BARDO = { name: 'Bardo Museum', lat: 36.8094, lng: 10.1342 };
