import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

export interface VisitCursor {
  visitedAt: Date;
  id: Types.ObjectId;
}

export function encodeVisitCursor(visitedAt: Date, id: Types.ObjectId): string {
  return Buffer.from(`${visitedAt.toISOString()}|${id.toString()}`).toString('base64url');
}

export function decodeVisitCursor(cursor: string): VisitCursor {
  try {
    const decoded = Buffer.from(cursor, 'base64url').toString('utf8');
    const separator = decoded.lastIndexOf('|');
    const date = decoded.slice(0, separator);
    const id = decoded.slice(separator + 1);
    if (separator < 0 || Number.isNaN(Date.parse(date)) || !Types.ObjectId.isValid(id)) {
      throw new Error();
    }
    return { visitedAt: new Date(date), id: new Types.ObjectId(id) };
  } catch {
    throw new BadRequestException('Invalid pagination cursor');
  }
}
