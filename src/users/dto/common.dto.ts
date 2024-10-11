import { IsString } from 'class-validator';

export class AuthResponse {
  @IsString()
  name: string;

  @IsString()
  email: string;
}
