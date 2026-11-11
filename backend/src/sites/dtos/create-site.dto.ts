import { Transform } from 'class-transformer';
import { IsMongoId, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { normalizeAddress } from '../../common/address.js';

export class CreateSiteDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? normalizeAddress(value) : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(253)
  address: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  title: string;

  @IsString()
  @IsNotEmpty()
  html: string;

  @IsMongoId()
  authorId: string;
}
