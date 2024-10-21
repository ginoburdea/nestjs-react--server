import { Transform } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectBody {
  @IsString()
  @MinLength(4)
  @MaxLength(256)
  @Transform(({ value }) => value.trim())
  name: string;

  @IsUrl()
  @MinLength(4)
  @MaxLength(256)
  @Transform(({ value }) => value.trim())
  url: string;

  @IsOptional()
  @IsString()
  @MinLength(4)
  @MaxLength(4096)
  @Transform(({ value }) => {
    const result = value?.trim();
    if (result === '') return;
    return result;
  })
  description?: string;

  @IsIn(['true', 'false'])
  @Transform(({ value }) => value === 'true', { toPlainOnly: true })
  active: boolean;
}

export class CreateProjectBodySwagger extends CreateProjectBody {
  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    required: false,
  })
  photos?: any[];
}

export class CreateProjectResponse {
  @IsInt()
  id: number;
}
