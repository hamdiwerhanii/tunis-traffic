import { Logger } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';

async function startDemo(): Promise<void> {
  const mongo = await MongoMemoryServer.create({ instance: { launchTimeout: 60_000 } });
  process.env.MONGODB_URI = mongo.getUri('tunis-traffic');

  const { bootstrap } = await import('./bootstrap.js');
  const app = await bootstrap();

  new Logger('Demo').log('In-memory database: data is lost when the server stops');

  const shutdown = async () => {
    await app.close();
    await mongo.stop();
    process.exit(0);
  };
  process.once('SIGINT', () => void shutdown());
  process.once('SIGTERM', () => void shutdown());
}

void startDemo();
