import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { FavoriteModule } from './favorite/favorite.module.js';
import { SearchHistoryModule } from './search-history/search-history.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI!, {
      autoIndex: true,
    }),
    FavoriteModule,
    SearchHistoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
