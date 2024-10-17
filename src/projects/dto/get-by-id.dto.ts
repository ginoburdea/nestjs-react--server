import { Transform } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class GetProjectByIdParams {
  @Transform(({ value }) => parseFloat(value))
  @IsInt()
  @Min(1)
  id: number;
}
