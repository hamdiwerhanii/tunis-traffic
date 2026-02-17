import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FavoriteController } from './favorite.controller.js';
import { FavoriteService } from './favorite.service.js';
import { Favorite, FavoriteSchema } from './schema/favorite.schema.js';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Favorite.name, schema: FavoriteSchema },
        ]),
    ],
    controllers: [FavoriteController],
    providers: [FavoriteService],
    exports: [FavoriteService],
})
export class FavoriteModule { }
