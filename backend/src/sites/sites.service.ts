import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { normalizeAddress } from '../common/address.js';
import { extractReadableText } from '../common/html-text.js';
import { Person } from '../people/schemas/person.schema.js';
import { Site } from './schemas/site.schema.js';
import { CreateSiteDto } from './dtos/create-site.dto.js';

@Injectable()
export class SitesService {
  constructor(
    @InjectModel(Site.name) private readonly siteModel: Model<Site>,
    @InjectModel(Person.name) private readonly personModel: Model<Person>,
  ) {}

  async findByAddress(address: string) {
    const normalizedAddress = normalizeAddress(address);
    const site = await this.siteModel
      .findOne({ address: normalizedAddress })
      .populate('authorId', '_id name')
      .lean()
      .exec();

    if (!site) {
      throw new NotFoundException(`Website not found: ${normalizedAddress}`);
    }
    return site;
  }

  async findResolvedByAddress(address: string) {
    return this.siteModel.findOne({ address: normalizeAddress(address) }).lean().exec();
  }

  async create(dto: CreateSiteDto) {
    const address = normalizeAddress(dto.address);
    const authorExists = await this.personModel.exists({ _id: dto.authorId });
    if (!authorExists) {
      throw new NotFoundException('Author person was not found');
    }

    try {
      const site = await this.siteModel.create({
        address,
        title: dto.title.trim(),
        html: dto.html,
        contentText: extractReadableText(dto.html),
        authorId: new Types.ObjectId(dto.authorId),
      });
      return this.siteModel
        .findById(site._id)
        .populate('authorId', '_id name')
        .lean()
        .exec();
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 11000
      ) {
        throw new ConflictException('A website already exists at this address');
      }
      throw error;
    }
  }
}
