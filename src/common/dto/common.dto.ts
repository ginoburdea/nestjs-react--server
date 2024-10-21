import { IsObject, IsString } from 'class-validator';

class BaseErrorResponse {
  @IsString()
  error: string;

  @IsString()
  message: string;
}

export class UnknownErrorResponse extends BaseErrorResponse {}

export class UnauthorizedErrorResponse extends BaseErrorResponse {}

export class ValidationErrorResponse extends BaseErrorResponse {
  /** Cheia este argumentul cu eroare, iar valoarea acestuia este eroarea */
  @IsObject()
  details: object;
}
