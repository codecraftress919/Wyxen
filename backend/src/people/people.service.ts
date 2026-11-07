import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Person } from './schemas/person.schema.js';

@Injectable()
export class PeopleService {
  constructor(@InjectModel(Person.name) private readonly personModel: Model<Person>) {}

  async findAll() {
    return this.personModel
      .find({}, { _id: 1, name: 1, createdAt: 1 })
      .sort({ name: 1 })
      .lean()
      .exec();
  }

  async findById(id: string) {
    return this.personModel.findById(id).lean().exec();
  }
}
