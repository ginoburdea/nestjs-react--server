import {
  ValidationException,
  ValidationExceptionCode,
  validationMessages,
} from '../common/validation.exception';

export const expectValidationError = async (
  field: string,
  code: ValidationExceptionCode,
  fn: () => any,
) => {
  let errors = 0;
  try {
    await fn();
  } catch (error) {
    errors++;
    expect(error).toBeInstanceOf(ValidationException);

    const fieldsWithErrors = Object.keys(
      (error as ValidationException).details,
    );
    expect(fieldsWithErrors).toContain(field);

    expect((error as ValidationException).details[field]).toEqual(
      validationMessages[code],
    );
  }
  expect(errors).toEqual(1);
};
