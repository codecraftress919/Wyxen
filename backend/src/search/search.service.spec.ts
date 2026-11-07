import { describe, expect, it, vi } from 'vitest';
import { SearchService } from './search.service.js';

describe('SearchService', () => {
  it('searches content without loading the full HTML result set into memory', async () => {
    const aggregate = vi.fn().mockResolvedValue([
      { address: 'tidepool.zz', title: 'Tidepool', excerpt: 'Tidal life' },
    ]);
    const service = new SearchService({ aggregate } as never);

    await expect(service.search('tidal', 10)).resolves.toHaveLength(1);
    const pipeline = aggregate.mock.calls[0][0] as Array<Record<string, unknown>>;
    expect(pipeline[0]).toEqual({ $match: { $text: { $search: 'tidal' } } });
  });
});
