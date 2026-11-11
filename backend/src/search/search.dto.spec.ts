import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { SearchQueryDto } from '../common/dtos.js';

describe('SearchQueryDto', () => {
  it('trims and validates bounded queries and result counts', async () => {
    const valid = plainToInstance(SearchQueryDto, { q: '  small web  ' });
    expect(valid.q).toBe('small web');
    await expect(validate(valid)).resolves.toHaveLength(0);

    const invalidQuery = plainToInstance(SearchQueryDto, {
      q: 'x'.repeat(201),
      limit: '101',
    });
    const errors = await validate(invalidQuery);
    expect(errors.map(({ property }) => property)).toEqual(
      expect.arrayContaining(['q', 'limit']),
    );

    const emptyQuery = plainToInstance(SearchQueryDto, { q: '   ' });
    expect((await validate(emptyQuery)).map(({ property }) => property)).toContain(
      'q',
    );
  });
});
