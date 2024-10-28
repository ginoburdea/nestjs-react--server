import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ValidationException } from './validation.exception';
import { TargetLanguageCode, Translator } from 'deepl-node';
import acceptLanguage from 'accept-language';
import { TranslationService } from './translation.service';

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  constructor(private translationService: TranslationService) {}

  private translator = new Translator(process.env.DEEPL_API_KEY);

  private async translateDetails(
    details: Record<string, string>,
    targetLang: TargetLanguageCode,
  ) {
    let translated = {};
    for (const key in details) {
      const error = details[key];

      const formattedError = error.replaceAll('string', 'text');

      translated[key] = await this.translationService.translate(
        formattedError,
        'en',
        targetLang,
      );
    }
    return translated;
  }

  private async extractTargetLanguage(acceptLanguageHeader: string) {
    const availableLanguages = await this.translator.getTargetLanguages();
    const availableLanguageCodes = availableLanguages.map((lang) => lang.code);

    // The first language is the default one
    // Here we are making the Romanian as the default language
    acceptLanguage.languages([
      'ro',
      ...availableLanguageCodes.filter((lang) => lang !== 'ro'),
    ]);

    const targetLang = acceptLanguage.get(
      acceptLanguageHeader,
    ) as TargetLanguageCode;
    return targetLang;
  }

  async catch(exception: any, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    const req = host.switchToHttp().getRequest<Request>();

    const targetLang = await this.extractTargetLanguage(
      req.headers['accept-language'],
    );

    if (exception instanceof ValidationException) {
      res.status(exception.httpStatus).json({
        error: await this.translationService.translate(
          exception.message,
          'ro',
          targetLang,
        ),
        message: await this.translationService.translate(
          exception.description,
          'ro',
          targetLang,
        ),
        details: await this.translateDetails(exception.details, targetLang),
      });
      return;
    }

    if (exception instanceof UnauthorizedException) {
      res.status(401).json({
        error: await this.translationService.translate(
          'Neautorizat',
          'ro',
          targetLang,
        ),
        message: await this.translationService.translate(
          'Trebuie sa fi logat pentru a efectua aceasta actiune',
          'ro',
          targetLang,
        ),
      });
      return;
    }

    if (exception instanceof NotFoundException) {
      res.status(404).json({
        error: await this.translationService.translate(
          'Nu exista',
          'ro',
          targetLang,
        ),
        message: await this.translationService.translate(
          'Aceast url nu exista',
          'ro',
          targetLang,
        ),
      });
      return;
    }

    res.status(500).send({
      error: await this.translationService.translate(
        'Eroare neasteptata',
        'ro',
        targetLang,
      ),
      message: await this.translationService.translate(
        'A aparut o eroare neasteptata. Va rugam sa incercati mai tarziu',
        'ro',
        targetLang,
      ),
    });
  }
}
