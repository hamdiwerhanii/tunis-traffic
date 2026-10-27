import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

@Schema({ timestamps: { createdAt: true, updatedAt: false }, versionKey: false })
export class Favorite {
  @Prop({ required: true, index: true })
  sessionId: string;

  @Prop({ required: true, trim: true, maxlength: 120 })
  name: string;

  @Prop({ trim: true, maxlength: 300 })
  address?: string;

  @Prop({ required: true, min: -90, max: 90 })
  lat: number;

  @Prop({ required: true, min: -180, max: 180 })
  lng: number;

  createdAt: Date;
}

export type FavoriteDocument = HydratedDocument<Favorite>;

export const FavoriteSchema = SchemaFactory.createForClass(Favorite);
FavoriteSchema.index({ sessionId: 1, lat: 1, lng: 1 }, { unique: true });
