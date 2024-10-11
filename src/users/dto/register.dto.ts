import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterBody {
  @IsString()
  @MinLength(4)
  @MaxLength(128)
  @Transform(({ value }) => value.trim())
  name: string;

  @IsString()
  @MinLength(4)
  @MaxLength(128)
  @IsEmail()
  @Transform(({ value }) => value.trim().toLowerCase())
  email: string;

  @IsString()
  @MinLength(4)
  @MaxLength(128)
  @Transform(({ value }) => value.trim())
  password: string;

  @IsString()
  @Transform(({ value }) => value.trim())
  masterPassword: string;
}
