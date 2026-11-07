import { describe, expect, it, vi } from 'vitest';
import { VisitsService } from './visits.service.js';

describe('VisitsService', () => {
  it('records a successful visit and resolved site', async () => {
    const personId = '507f1f77bcf86cd799439011';
    const site = { _id: '507f191e810c19729de860ea', address: 'tidepool.zz' };
    const visit = { _id: '507f191e810c19729de860eb' };
    const create = vi.fn().mockResolvedValue(visit);
    const findById = vi.fn().mockReturnValue({
      populate: vi.fn().mockReturnValue({ lean: vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue(visit) }) }),
    });
    const findOne = vi.fn().mockReturnValue({ lean: vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue(site) }) });
    const service = new VisitsService(
      { create, findById } as never,
      { exists: vi.fn().mockResolvedValue({ _id: personId }) } as never,
      { findOne } as never,
    );

    await service.create({ personId, address: 'TIDEPOOL.ZZ', navigationType: 'typed' as never });
    expect(create).toHaveBeenCalledWith(expect.objectContaining({
      address: 'tidepool.zz',
      status: 'success',
      siteId: site._id,
    }));
  });

  it('records a missing address with a null siteId', async () => {
    const personId = '507f1f77bcf86cd799439011';
    const create = vi.fn().mockResolvedValue({ _id: 'visit' });
    const findById = vi.fn().mockReturnValue({
      populate: vi.fn().mockReturnValue({ lean: vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue({}) }) }),
    });
    const findOne = vi.fn().mockReturnValue({ lean: vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue(null) }) });
    const service = new VisitsService(
      { create, findById } as never,
      { exists: vi.fn().mockResolvedValue({ _id: personId }) } as never,
      { findOne } as never,
    );

    await service.create({ personId, address: 'missing.zz', navigationType: 'typed' as never });
    expect(create).toHaveBeenCalledWith(expect.objectContaining({
      address: 'missing.zz',
      status: 'not_found',
      siteId: null,
    }));
  });

  it('scopes history to the requested person', async () => {
    const personId = '507f1f77bcf86cd799439011';
    const find = vi.fn().mockReturnValue({
      sort: vi.fn().mockReturnValue({
        limit: vi.fn().mockReturnValue({
          populate: vi.fn().mockReturnValue({ lean: vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue([]) }) }),
        }),
      }),
    });
    const service = new VisitsService(
      { find } as never,
      { exists: vi.fn().mockResolvedValue({ _id: personId }) } as never,
      {} as never,
    );

    await service.history(personId, 20);
    expect(find).toHaveBeenCalledWith({ personId: expect.objectContaining({}) });
  });
});
