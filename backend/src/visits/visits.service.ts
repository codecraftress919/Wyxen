import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Visit } from './schemas/visit.schema.js';

@Injectable()
export class VisitsService {
  constructor(@InjectModel(Visit.name) private readonly visitModel: Model<Visit>) {}
}
