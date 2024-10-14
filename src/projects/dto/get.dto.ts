import { Transform } from 'class-transformer';
import { IsIn, IsInt, Min } from 'class-validator';

export class GetProjectsQuery {
  @IsIn(['newest', 'oldest'])
  order: 'newest' | 'oldest';

  @Transform(({ value }) => parseFloat(value))
  @IsInt()
  @Min(1)
  page: number;
}
