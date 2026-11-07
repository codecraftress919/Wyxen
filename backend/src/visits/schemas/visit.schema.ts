import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Person } from '../../people/schemas/person.schema.js';
import { Site } from '../../sites/schemas/site.schema.js';

export type NavigationType = 'typed' | 'link' | 'search' | 'history';
export type VisitStatus = 'success' | 'not_found';
export type VisitDocument = HydratedDocument<Visit>;

@Schema({ collection: 'visits', timestamps: false })
export class Visit {
  @Prop({ type: Types.ObjectId, ref: Person.name, required: true })
  personId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Site.name, default: null, required: false })
  siteId: Types.ObjectId | null;

  @Prop({ type: String, required: true, lowercase: true, trim: true })
  address: string;

  @Prop({ type: String, enum: ['typed', 'link', 'search', 'history'], required: true })
  navigationType: NavigationType;

  @Prop({ type: String, enum: ['success', 'not_found'], required: true })
  status: VisitStatus;

  @Prop({ type: Date, default: Date.now })
  visitedAt: Date;
}

export const VisitSchema = SchemaFactory.createForClass(Visit);
VisitSchema.index({ personId: 1, visitedAt: -1 });
