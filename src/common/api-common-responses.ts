import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import {
  UnknownErrorResponse,
  ValidationErrorResponse,
} from './dto/common.dto';

export const ApiCommonResponses = () => {
  return applyDecorators(
    ApiUnprocessableEntityResponse({
      description: 'Eroare de validare',
      type: ValidationErrorResponse,
    }),
    ApiBadRequestResponse({
      description: 'Eroare de validare',
      type: ValidationErrorResponse,
    }),
    ApiInternalServerErrorResponse({
      description: 'Eroare neasteptata',
      type: UnknownErrorResponse,
    }),
  );
};
