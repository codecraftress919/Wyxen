import { Transform } from 'class-transformer';
import { IsInt, IsMongoId, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class PersonIdDto {
  @IsMongoId()
  personId: string;
}

export class HistoryQueryDto {
  @IsMongoId()
  personId: string;

  @IsOptional()
  @Transform(({ value }) => (value === undefined ? 20 : Number(value)))
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;

  @IsOptional()
  @IsString()
  cursor?: string;
}

export class SearchQueryDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : '',
  )
  @IsNotEmpty()
  @IsString()
  q: string;

  @IsOptional()
  @Transform(({ value }) => (value === undefined ? 20 : Number(value)))
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;
}
