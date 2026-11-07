import { ConflictException, NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { SitesService } from './sites.service.js';

describe('SitesService', () => {
  it('retrieves an existing site and normalizes its address', async () => {
    const exec = vi.fn().mockResolvedValue({ address: 'tidepool.zz' });
    const lean = vi.fn().mockReturnValue({ exec });
    const populate = vi.fn().mockReturnValue({ lean });
    const findOne = vi.fn().mockReturnValue({ populate });
    const service = new SitesService({ findOne } as never, {} as never);

    await expect(service.findByAddress(' TIDEPOOL.ZZ ')).resolves.toMatchObject({
      address: 'tidepool.zz',
    });
    expect(findOne).toHaveBeenCalledWith({ address: 'tidepool.zz' });
  });

  it('reports a missing site', async () => {
    const exec = vi.fn().mockResolvedValue(null);
    const lean = vi.fn().mockReturnValue({ exec });
    const populate = vi.fn().mockReturnValue({ lean });
    const service = new SitesService({ findOne: vi.fn().mockReturnValue({ populate }) } as never, {} as never);

    await expect(service.findByAddress('missing.zz')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('publishes text without script or style contents and preserves HTML', async () => {
    const personExists = vi.fn().mockResolvedValue({ _id: 'person' });
    const create = vi.fn().mockResolvedValue({ _id: 'site' });
    const exec = vi.fn().mockResolvedValue({ address: 'tidepool.zz', html: '<script>x</script><p>Tidal life</p>' });
    const lean = vi.fn().mockReturnValue({ exec });
    const populate = vi.fn().mockReturnValue({ lean });
    const findById = vi.fn().mockReturnValue({ populate });
    const service = new SitesService(
      { create, findById } as never,
      { exists: personExists } as never,
    );

    await service.create({
      address: 'TIDEPOOL.ZZ',
      title: 'Tidepool',
      html: '<script>x</script><style>y</style><p>Tidal life</p>',
      authorId: '507f1f77bcf86cd799439011',
    });
    expect(create).toHaveBeenCalledWith(expect.objectContaining({
      address: 'tidepool.zz',
      contentText: 'Tidal life',
      html: '<script>x</script><style>y</style><p>Tidal life</p>',
    }));
  });

  it('rejects duplicate addresses', async () => {
    const duplicate = Object.assign(new Error('duplicate'), { code: 11000 });
    const service = new SitesService(
      { create: vi.fn().mockRejectedValue(duplicate) } as never,
      { exists: vi.fn().mockResolvedValue({ _id: 'person' }) } as never,
    );

    await expect(service.create({
      address: 'tidepool.zz',
      title: 'Tidepool',
      html: '<p>Content</p>',
      authorId: '507f1f77bcf86cd799439011',
    })).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects an unknown author', async () => {
    const service = new SitesService(
      { create: vi.fn() } as never,
      { exists: vi.fn().mockResolvedValue(null) } as never,
    );

    await expect(service.create({
      address: 'tidepool.zz',
      title: 'Tidepool',
      html: '<p>Content</p>',
      authorId: '507f1f77bcf86cd799439011',
    })).rejects.toBeInstanceOf(NotFoundException);
  });
});
