import { describe, expect, it, vi } from 'vitest';
import { PeopleService } from './people.service.js';

describe('PeopleService', () => {
  it('lists people sorted alphabetically', async () => {
    const exec = vi.fn().mockResolvedValue([
      { _id: '1', name: 'Ada', createdAt: new Date() },
      { _id: '2', name: 'Linus', createdAt: new Date() },
    ]);
    const lean = vi.fn().mockReturnValue({ exec });
    const sort = vi.fn().mockReturnValue({ lean });
    const find = vi.fn().mockReturnValue({ sort });
    const service = new PeopleService({ find } as never);

    await expect(service.findAll()).resolves.toHaveLength(2);
    expect(sort).toHaveBeenCalledWith({ name: 1 });
  });
});
