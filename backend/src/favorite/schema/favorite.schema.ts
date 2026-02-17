import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FavoriteDocument = Favorite & Document;

@Schema({ timestamps: true })
export class Favorite {
    @Prop({ required: true })
    name: string;

    @Prop({ required: false })
    address: string;

    @Prop({ required: true })
    lat: number;

    @Prop({ required: true })
    lng: number;

    @Prop({ required: true, index: true })
    sessionId: string;

    _id: string;
    createdAt: Date;
    updatedAt: Date;
}

export const FavoriteSchema = SchemaFactory.createForClass(Favorite);
