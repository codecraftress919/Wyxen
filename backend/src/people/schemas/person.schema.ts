import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PersonDocument = HydratedDocument<Person>;

@Schema({ collection: 'people', timestamps: { createdAt: true, updatedAt: false } })
export class Person {
  @Prop({ type: String, required: true, unique: true, trim: true })
  name: string;

  createdAt: Date;
}

export const PersonSchema = SchemaFactory.createForClass(Person);
