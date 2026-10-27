import { MongoMemoryServer } from 'mongodb-memory-server';
import type { TestProject } from 'vitest/node';

declare module 'vitest' {
  export interface ProvidedContext {
    mongoUri: string;
  }
}

export default async function setup(project: TestProject): Promise<() => Promise<void>> {
  const mongo = await MongoMemoryServer.create({ instance: { launchTimeout: 60_000 } });
  project.provide('mongoUri', mongo.getUri());

  return async () => {
    await mongo.stop();
  };
}
