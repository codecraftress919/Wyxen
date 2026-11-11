import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { CreateSiteDto } from './create-site.dto.js';

describe('CreateSiteDto', () => {
  it('normalizes a valid address and validates publishing fields', async () => {
    const dto = plainToInstance(CreateSiteDto, {
      address: '  MySite.ZZ ',
      title: '  My site  ',
      html: '<main><h1>My site</h1></main>',
      authorId: '507f1f77bcf86cd799439011',
    });

    expect(dto.address).toBe('mysite.zz');
    expect(dto.title).toBe('My site');
    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rejects invalid addresses and missing required publishing fields', async () => {
    expect(() =>
      plainToInstance(CreateSiteDto, {
        address: 'https://example.com/path',
        title: 'Site',
        html: '<p>Content</p>',
        authorId: '507f1f77bcf86cd799439011',
      }),
    ).toThrow();

    const dto = plainToInstance(CreateSiteDto, {
      address: 'site.zz',
      title: '   ',
      html: '',
      authorId: 'not-an-object-id',
    });
    expect((await validate(dto)).map(({ property }) => property)).toEqual(
      expect.arrayContaining(['title', 'html', 'authorId']),
    );
  });
});
