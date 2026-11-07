import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { normalizeAddress } from '../common/address.js';
import { Person } from '../people/schemas/person.schema.js';
import { Site } from '../sites/schemas/site.schema.js';
import { decodeVisitCursor, encodeVisitCursor } from './cursor.js';
import { CreateVisitDto } from './dtos/create-visit.dto.js';
import { Visit } from './schemas/visit.schema.js';

@Injectable()
export class VisitsService {
  constructor(
    @InjectModel(Visit.name) private readonly visitModel: Model<Visit>,
    @InjectModel(Person.name) private readonly personModel: Model<Person>,
    @InjectModel(Site.name) private readonly siteModel: Model<Site>,
  ) {}

  async create(dto: CreateVisitDto) {
    const personExists = await this.personModel.exists({ _id: dto.personId });
    if (!personExists) {
      throw new NotFoundException('Person was not found');
    }

    const address = normalizeAddress(dto.address);
    const site = await this.siteModel.findOne({ address }).lean().exec();
    const visit = await this.visitModel.create({
      personId: new Types.ObjectId(dto.personId),
      siteId: site?._id ?? null,
      address,
      navigationType: dto.navigationType,
      status: site ? 'success' : 'not_found',
    });

    return {
      visit: await this.visitModel.findById(visit._id).populate('siteId').lean().exec(),
      site,
    };
  }

  async history(personId: string, limit = 20, cursor?: string) {
    const personExists = await this.personModel.exists({ _id: personId });
    if (!personExists) {
      throw new NotFoundException('Person was not found');
    }

    const filter: Record<string, unknown> = { personId: new Types.ObjectId(personId) };
    if (cursor) {
      const decoded = decodeVisitCursor(cursor);
      filter.$or = [
        { visitedAt: { $lt: decoded.visitedAt } },
        { visitedAt: decoded.visitedAt, _id: { $lt: decoded.id } },
      ];
    }

    const visits = await this.visitModel
      .find(filter)
      .sort({ visitedAt: -1, _id: -1 })
      .limit(limit + 1)
      .populate('siteId', 'address title')
      .lean()
      .exec();

    const hasMore = visits.length > limit;
    const page = visits.slice(0, limit);
    const last = page.at(-1) as (Visit & { _id: Types.ObjectId; visitedAt: Date }) | undefined;

    return {
      data: page.map((visit) => ({
        _id: visit._id,
        address: visit.address,
        status: visit.status,
        navigationType: visit.navigationType,
        visitedAt: visit.visitedAt,
        site: visit.siteId && typeof visit.siteId === 'object' ? visit.siteId : null,
      })),
      nextCursor: hasMore && last ? encodeVisitCursor(last.visitedAt, last._id) : null,
    };
  }
}
