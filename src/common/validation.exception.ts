import { HttpException, HttpStatus } from '@nestjs/common';

export const validationMessages = {
  INVALID_MASTER_PASSWORD: 'Parola master este incorrecta',
  EMAIL_IN_USE: 'Emailul este deja asociat cu un cont',
  INVALID_CREDENTIALS: 'Adresa de email sau parola este incorecta',
  PROJECT_NOT_FOUND: 'Proiectul nu a fost gasit',
  PHOTO_NOT_FOUND: 'Nu a fost gasita nicio poza cu acest nume',
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

  static fromCode(code: ValidationExceptionCode, field: string | string[]) {
    const details = [field].flat().reduce(
      (details, field) => ({
        ...details,
        [field]: validationMessages[code],
      }),
      {},
    );
    return new this(400, details);
  }
}
