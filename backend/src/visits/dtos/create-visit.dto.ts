import { Transform } from 'class-transformer';
import { IsEnum, IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export enum NavigationType {
  TYPED = 'typed',
  LINK = 'link',
  SEARCH = 'search',
  HISTORY = 'history',
}

export class CreateVisitDto {
  @IsMongoId()
  personId: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsEnum(NavigationType)
  navigationType: NavigationType;
}
