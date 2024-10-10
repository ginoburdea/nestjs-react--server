import { HttpStatus, ValidationPipeOptions } from '@nestjs/common';
import { ValidationException } from 'src/common/validation.exception';

export const validationPipeConfig: ValidationPipeOptions = {
  whitelist: true,
  exceptionFactory(errors) {
    const details = Object.fromEntries(
      errors.map((err) => [
        err.property,
        Object.values(err.constraints).at(-1),
      ]),
    );

    return new ValidationException(HttpStatus.UNPROCESSABLE_ENTITY, details);
  },
};
