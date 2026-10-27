import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model, Types } from 'mongoose';
import { isDuplicateKeyError } from '../common/database/mongo-errors.js';
import { roundCoordinate } from '../common/geo/tunisia.js';
import { CreateFavoriteDto } from './dto/create-favorite.dto.js';
import { FavoriteResponseDto, toFavoriteResponse } from './dto/favorite-response.dto.js';
import { Favorite } from './favorite.schema.js';

export const MAX_FAVORITES = 50;

@Injectable()
export class FavoritesService {
  constructor(@InjectModel(Favorite.name) private readonly favorites: Model<Favorite>) {}

  async list(sessionId: string): Promise<FavoriteResponseDto[]> {
    const favorites = await this.favorites.find({ sessionId }).sort({ createdAt: -1 }).lean();
    return favorites.map(toFavoriteResponse);
  }

  async create(sessionId: string, dto: CreateFavoriteDto): Promise<FavoriteResponseDto> {
    const count = await this.favorites.countDocuments({ sessionId });
    if (count >= MAX_FAVORITES) {
      throw new BadRequestException(`You can save up to ${MAX_FAVORITES} favorite places`);
    }

    try {
      const favorite = await this.favorites.create({
        sessionId,
        name: dto.name,
        address: dto.address || undefined,
        lat: roundCoordinate(dto.lat),
        lng: roundCoordinate(dto.lng),
      });
      return toFavoriteResponse(favorite.toObject());
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new ConflictException('This place is already in your favorites');
      }
      throw error;
    }
  }

  async remove(sessionId: string, id: Types.ObjectId): Promise<void> {
    const deleted = await this.favorites.findOneAndDelete({ _id: id, sessionId });
    if (!deleted) throw new NotFoundException('Favorite not found');
  }
}
