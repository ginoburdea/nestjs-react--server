import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
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

    res.status(500).send({
      error: 'Eroare neasteptata',
      message:
        'A aparut o eroare neasteptata. Va rugam sa incercati mai tarziu',
    });
  }
}
