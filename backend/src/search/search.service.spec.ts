import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { SearchService } from './search.service.js';

describe('SearchService', () => {
  it('searches indexed title and content fields in relevance order', async () => {
    const aggregate = vi.fn().mockResolvedValue([
      {
        address: 'tidepool.zz',
        title: 'Tidepool',
        contentText: 'A quiet coast. Tidal pools shelter small sea life.',
        author: { _id: 'person-id', name: 'Avery' },
      },
    ]);
    const service = new SearchService({ aggregate } as never);

    await expect(service.search('tidal', 10)).resolves.toEqual([
      {
        address: 'tidepool.zz',
        title: 'Tidepool',
        excerpt: 'A quiet coast. Tidal pools shelter small sea life.',
        author: { _id: 'person-id', name: 'Avery' },
      },
    ]);
    const pipeline = aggregate.mock.calls[0][0] as Array<Record<string, unknown>>;
    expect(pipeline[0]).toEqual({ $match: { $text: { $search: 'tidal' } } });
    expect(pipeline[2]).toEqual({ $sort: { relevance: -1 } });
    expect(pipeline[3]).toEqual({ $limit: 10 });
    expect(pipeline.at(-1)).toEqual({
      $project: {
        _id: 0,
        address: 1,
        title: 1,
        contentText: 1,
        author: { _id: '$author._id', name: '$author.name' },
      },
    });
    expect(JSON.stringify(pipeline)).not.toContain('html');
    expect(
      Object.keys((await service.search('tidal', 10))[0]).sort(),
    ).toEqual(['address', 'author', 'excerpt', 'title']);
  });

  it('places the excerpt around a matching content term', async () => {
    const contentText = `${'A peaceful shoreline. '.repeat(20)}A rare tidal pool shelters a crab.${' The coast is quiet.'.repeat(12)}`;
    const aggregate = vi.fn().mockResolvedValue([
      { address: 'coast.zz', title: 'Coast', contentText },
    ]);
    const service = new SearchService({ aggregate } as never);

    const [result] = await service.search('tidal', 20);
    expect(result.excerpt).toContain('tidal pool');
    expect(result.excerpt).toContain('…');
  });

  it('rejects empty or oversized queries and caps result count', async () => {
    const aggregate = vi.fn().mockResolvedValue([]);
    const service = new SearchService({ aggregate } as never);

    await expect(service.search('   ')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(service.search('x'.repeat(201))).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await service.search('tide', 500);
    expect(aggregate.mock.calls[0][0][3]).toEqual({ $limit: 100 });
  });
});
