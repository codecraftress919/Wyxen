import { BadRequestException } from '@nestjs/common';

export function normalizeAddress(value: string): string {
  const address = value.trim().toLowerCase();

  if (
    !address ||
    address.includes('://') ||
    /[/?#]/u.test(address) ||
    /\s/u.test(address) ||
    !/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/u.test(address)
  ) {
    throw new BadRequestException('Address must be a domain without a protocol, path, or query string');
  }

  return address;
}
