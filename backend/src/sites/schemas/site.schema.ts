import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Person } from '../../people/schemas/person.schema.js';

export type SiteDocument = HydratedDocument<Site>;

@Schema({ collection: 'sites', timestamps: true })
export class Site {
  @Prop({
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  })
  address: string;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  html: string;

  @Prop({ type: String, required: true })
  contentText: string;

  @Prop({ type: Types.ObjectId, ref: Person.name, required: true })
  authorId: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

export const SiteSchema = SchemaFactory.createForClass(Site);
SiteSchema.index({ address: 1 }, { unique: true });
SiteSchema.index({ title: 'text', contentText: 'text' });
