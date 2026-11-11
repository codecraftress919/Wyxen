import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Site } from '../sites/schemas/site.schema.js';

interface SearchDocument {
  address: string;
  title: string;
  contentText: string;
  author?: { _id: unknown; name: string };
}

function createExcerpt(text: string, query: string): string {
  const excerptLength = 240;
  const terms = query.match(/[\p{L}\p{N}]+/gu) ?? [];
  const normalizedText = text.toLocaleLowerCase();
  const firstMatch = terms.reduce((earliest, term) => {
    const position = normalizedText.indexOf(term.toLocaleLowerCase());
    return position >= 0 && (earliest < 0 || position < earliest)
      ? position
      : earliest;
  }, -1);
  const start = firstMatch < 0 ? 0 : Math.max(0, firstMatch - 80);
  const excerpt = text.slice(start, start + excerptLength).trim();

  return `${start > 0 ? '…' : ''}${excerpt}${
    start + excerptLength < text.length ? '…' : ''
  }`;
}

@Injectable()
export class SearchService {
  constructor(@InjectModel(Site.name) private readonly siteModel: Model<Site>) {}

  async search(query: string, limit = 20) {
    const normalizedQuery = query.trim();
    if (!normalizedQuery || normalizedQuery.length > 200) {
      throw new BadRequestException('Search query must be between 1 and 200 characters');
    }

    const resultLimit = Math.min(Math.max(Math.trunc(limit), 1), 100);
    const results = await this.siteModel.aggregate<SearchDocument>([
      { $match: { $text: { $search: normalizedQuery } } },
      { $set: { relevance: { $meta: 'textScore' } } },
      { $sort: { relevance: -1 } },
      { $limit: resultLimit },
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
          contentText: 1,
          author: { _id: '$author._id', name: '$author.name' },
        },
      },
    ]);

    return results.map(({ address, title, contentText, author }) => ({
      address,
      title,
      excerpt: createExcerpt(contentText, normalizedQuery),
      ...(author ? { author } : {}),
    }));
  }
}
