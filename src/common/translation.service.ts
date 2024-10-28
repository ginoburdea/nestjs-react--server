import { Injectable } from '@nestjs/common';
import { SourceLanguageCode, TargetLanguageCode, Translator } from 'deepl-node';

export abstract class TranslationService {
  async translate(
    text: string,
    sourceLang: SourceLanguageCode,
    targetLang: TargetLanguageCode,
  ): Promise<string> {
    return '';
  }
}

export class LocalTranslationService implements TranslationService {
  async translate(
    text: string,
    sourceLang: SourceLanguageCode,
    targetLang: TargetLanguageCode,
  ): Promise<string> {
    return text;
  }
}

/**
 * The key is the original error and the value is an object with: the key the target language and the value the translated text
 */
const translationsCache: Record<
  string,
  Partial<Record<TargetLanguageCode, string>>
> = {};

export class DeepLTranslationService implements TranslationService {
  private translator = new Translator(process.env.DEEPL_API_KEY);

  async translate(
    text: string,
    sourceLang: SourceLanguageCode,
    targetLang: TargetLanguageCode,
  ): Promise<string> {
    if (!translationsCache[text]) {
      translationsCache[text] = {};
    }

    if (!translationsCache[text][targetLang]) {
      const translationResult = await this.translator.translateText(
        text,
        sourceLang,
        targetLang,
      );

      translationsCache[text][targetLang] = translationResult.text;
    }

    return translationsCache[text][targetLang];
  }
}
