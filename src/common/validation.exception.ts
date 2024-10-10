import { HttpException, HttpStatus } from '@nestjs/common';

export const validationMessages = {
  INVALID_MASTER_PASSWORD: 'Parola master este incorrecta',
};

export type ValidationExceptionCode = keyof typeof validationMessages;

export class ValidationException extends HttpException {
  description =
    'A aparut o eroare de validare. Verificati datele si sa incercati din nou.';

  constructor(
    public httpStatus = HttpStatus.BAD_REQUEST,
    public details: any,
  ) {
    super('Eroare de validare', httpStatus);
  }

  static fromCode(code: ValidationExceptionCode, field: string) {
    return new this(400, { [field]: validationMessages[code] });
  }
}
