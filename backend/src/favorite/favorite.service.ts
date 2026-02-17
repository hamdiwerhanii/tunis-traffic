import {
    Injectable,
    Logger,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Favorite } from './schema/favorite.schema.js';
import { CreateFavoriteDto } from './dto/create-favorite.dto.js';

@Injectable()
export class FavoriteService {
    constructor(
        @InjectModel(Favorite.name) private favoriteModel: Model<Favorite>,
    ) { }

    private readonly logger = new Logger(FavoriteService.name);

    async create(createFavoriteDto: CreateFavoriteDto): Promise<Favorite> {
        try {
            // Check for duplicate (same sessionId + same coordinates)
            const existing = await this.favoriteModel
                .findOne({
                    sessionId: createFavoriteDto.sessionId,
                    lat: createFavoriteDto.lat,
                    lng: createFavoriteDto.lng,
                })
                .exec();

            if (existing) {
                throw new BadRequestException('This place is already in your favorites');
            }

            const favorite = new this.favoriteModel(createFavoriteDto);
            return favorite.save();
        } catch (error) {
            if (error instanceof BadRequestException) throw error;
            this.logger.error(`Failed to create favorite: ${error}`);
            throw error;
        }
    }

    async findBySession(sessionId: string): Promise<Favorite[]> {
        try {
            return this.favoriteModel
                .find({ sessionId })
                .sort({ createdAt: -1 })
                .lean()
                .exec();
        } catch (error) {
            this.logger.error(`Failed to find favorites: ${error}`);
            throw error;
        }
    }

    async remove(id: string, sessionId: string): Promise<Favorite> {
        try {
            const favorite = await this.favoriteModel
                .findOneAndDelete({ _id: id, sessionId })
                .exec();

            if (!favorite) {
                throw new NotFoundException('Favorite not found');
            }

            return favorite;
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            this.logger.error(`Failed to remove favorite: ${error}`);
            throw error;
        }
    }
}
