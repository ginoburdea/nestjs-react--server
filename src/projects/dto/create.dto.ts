import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString } from 'class-validator';

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

  @IsIn(['true', 'false'])
  @Transform(({ value }) => value === 'true', { toPlainOnly: true })
  active: boolean;
}

export class CreateProjectResponse {
  @IsInt()
  id: number;
}
