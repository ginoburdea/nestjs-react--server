import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class GetProjectByIdParams {
  @Transform(({ value }) => parseFloat(value))
  @IsInt()
  @Min(1)
  id: number;
}

class Photo {
  name: string;
  url: string;
}

export class GetProjectByIdResponse {
  @IsInt()
  id: number;

  @IsString()
  name: string;

  @IsBoolean()
  active: boolean;

  @IsString()
  description: string | null;

  @IsString()
  url: string;

  @ValidateNested()
  @Type(() => Photo)
  photos: Photo[];
}
