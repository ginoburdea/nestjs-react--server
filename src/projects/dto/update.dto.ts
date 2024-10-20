import { PartialType } from '@nestjs/swagger';
import { CreateProjectBody } from './create.dto';
import { Transform } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateProjectParams {
  @Transform(({ value }) => parseFloat(value))
  @IsInt()
  @Min(1)
  id: number;
}

export class UpdateProjectBody extends PartialType(CreateProjectBody) {
  /** The names of the photos to delete */
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  photosToDelete?: string[];
}
