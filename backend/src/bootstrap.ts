import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.js';
import { API_PREFIX, configureApp, DOCS_PATH } from './app.setup.js';
import { AppConfigService } from './config/app-config.service.js';

export async function bootstrap(): Promise<NestExpressApplication> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  configureApp(app);

  const config = app.get(AppConfigService);
  await app.listen(config.port);

  const logger = new Logger('Bootstrap');
  logger.log(`API ready on http://localhost:${config.port}/${API_PREFIX}`);
  if (config.swaggerEnabled) logger.log(`Docs on http://localhost:${config.port}/${DOCS_PATH}`);
  logger.log(
    config.tomtomApiKey
      ? 'Live traffic: TomTom enabled'
      : 'Live traffic: off (set TOMTOM_API_KEY), routes use OSRM',
  );

  return app;
}
