import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class CreateProjectBody {
  @IsString()
  @Transform(({ value }) => value.trim())
  name: string;

  @IsString()
  @Transform(({ value }) => value.trim())
  url: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  description?: string;
}
