import { Transform } from 'class-transformer';
import { IsMongoId, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateSiteDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
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
