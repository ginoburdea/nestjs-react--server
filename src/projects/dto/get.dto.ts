import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsString,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export class GetProjectsQuery {
  @IsIn(['newest', 'oldest'])
  order: 'newest' | 'oldest';

  @Transform(({ value }) => parseFloat(value))
  @IsInt()
  @Min(1)
  page: number;
}

class Meta {
  @IsInt()
  firstPage: number;

  @IsInt()
  lastPage: number;

  @IsInt()
  pageSize: number;

  @IsInt()
  @ValidateIf((_, value) => value !== null)
  prevPage: number | null;

  @IsInt()
  @ValidateIf((_, value) => value !== null)
  nextPage: number | null;

  @IsInt()
  currentPage: number;
}

class Project {
  @IsInt()
  id: number;

  @IsString()
  name: string;

  @IsString()
  photo: string;

  @IsBoolean()
  active: boolean;
}

export class GetProjectsResponse {
  @ValidateNested()
  @Type(() => Project)
  results: Project[];

  @ValidateNested()
  @Type(() => Meta)
  meta: Meta;
}
