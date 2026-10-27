import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { SessionMiddleware } from './common/session/session.middleware.js';
import { AppConfigModule } from './config/app-config.module.js';
import { AppConfigService } from './config/app-config.service.js';
import { FavoritesModule } from './favorites/favorites.module.js';
import { HealthController } from './health/health.controller.js';
import { PlacesModule } from './places/places.module.js';
import { RoutesModule } from './routes/routes.module.js';
import { SearchHistoryModule } from './search-history/search-history.module.js';
import { TrafficModule } from './traffic/traffic.module.js';

@Module({
  imports: [
    AppConfigModule,
    MongooseModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        uri: config.mongoUri,
        autoIndex: true,
        serverSelectionTimeoutMS: 5000,
      }),
    }),
    ThrottlerModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        throttlers: [{ name: 'default', ttl: 60_000, limit: 120 }],
        skipIf: () => config.isTest,
      }),
    }),
    FavoritesModule,
    SearchHistoryModule,
    PlacesModule,
    RoutesModule,
    TrafficModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(SessionMiddleware).forRoutes('{*splat}');
  }
}
