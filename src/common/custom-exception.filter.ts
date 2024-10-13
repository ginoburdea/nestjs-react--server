import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { ValidationException } from './validation.exception';

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();

    if (exception instanceof ValidationException) {
      res.status(exception.httpStatus).json({
        error: exception.message,
        message: exception.description,
        details: exception.details,
      });
      return;
    }

    if (exception instanceof UnauthorizedException) {
      res.status(401).json({
        error: 'Neautorizat',
        message: 'Trebuie sa fi logat pentru a efectua aceasta actiune',
      });
      return;
    }

    res.status(500).send({
      error: 'Eroare neasteptata',
      message:
        'A aparut o eroare neasteptata. Va rugam sa incercati mai tarziu',
    });
  }
}
