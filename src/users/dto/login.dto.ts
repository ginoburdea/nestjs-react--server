import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginBody {
  @IsString()
  @IsEmail()
  @Transform(({ value }) => value.trim().toLowerCase())
  email: string;

  @IsString()
  @Transform(({ value }) => value.trim())
  password: string;
}
