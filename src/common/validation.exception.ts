import { HttpException, HttpStatus } from '@nestjs/common';

const validationMessages = {};

export class ValidationException extends HttpException {
  description =
    'A aparut o eroare de validare. Verificati datele si sa incercati din nou.';

  constructor(
    public httpStatus = HttpStatus.BAD_REQUEST,
    public details: any,
  ) {
    super('Eroare de validare', httpStatus);
  }

  static fromCode(code: keyof typeof validationMessages, field: string) {
    return new this(400, { [field]: validationMessages[code] });
  }
}
