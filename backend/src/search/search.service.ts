import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Site } from '../sites/schemas/site.schema.js';

@Injectable()
export class SearchService {
  constructor(@InjectModel(Site.name) private readonly siteModel: Model<Site>) {}

  async search(query: string, limit = 20) {
    const results = await this.siteModel.aggregate([
      { $match: { $text: { $search: query } } },
      { $set: { relevance: { $meta: 'textScore' } } },
      { $sort: { relevance: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'people',
          localField: 'authorId',
          foreignField: '_id',
          as: 'author',
        },
      },
      { $unwind: '$author' },
      {
        $project: {
          _id: 0,
          address: 1,
          title: 1,
          author: { _id: '$author._id', name: '$author.name' },
          excerpt: {
            $let: {
              vars: { text: '$contentText' },
              in: { $substrCP: ['$$text', 0, 240] },
            },
          },
          relevance: 1,
        },
      },
    ]);
    return results;
  }
}
