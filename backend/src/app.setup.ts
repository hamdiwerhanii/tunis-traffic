import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { SESSION_COOKIE } from './common/session/session.middleware.js';
import { AppConfigService } from './config/app-config.service.js';

export const API_PREFIX = 'api';
export const DOCS_PATH = `${API_PREFIX}/docs`;

export function configureApp(app: NestExpressApplication): void {
  const config = app.get(AppConfigService);

  app.set('trust proxy', config.trustProxy);
  app.disable('x-powered-by');
  app.setGlobalPrefix(API_PREFIX);
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'same-site' } }));
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableShutdownHooks();

  if (config.swaggerEnabled) {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('Tunis Traffic API')
        .setDescription(
          'Favorites, recent searches, place search, route planning and live traffic tiles for Tunis.',
        )
        .setVersion('2.0')
        .addCookieAuth(SESSION_COOKIE)
        .build(),
    );
    SwaggerModule.setup(DOCS_PATH, app, document);
  }
}
