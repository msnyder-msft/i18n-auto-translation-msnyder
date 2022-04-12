import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { decode, encode } from 'html-entities';
import { argv } from '../cli';
import { JSONObj, NLPTranslateResponse } from '../payload';
import { Translate } from '../translate';

export class NLPRapidAPI extends Translate {
  private static readonly endpoint: string = 'nlp-translation.p.rapidapi.com';
  private static readonly axiosConfig: AxiosRequestConfig = {
    headers: {
      'X-RapidAPI-Host': NLPRapidAPI.endpoint,
      'X-RapidAPI-Key': argv.key,
      'Content-type': 'application/x-www-form-urlencoded',
    },
    responseType: 'json',
  };

  protected callTranslateAPI = async (
    valuesForTranslation: string[],
    originalObject: JSONObj,
    saveTo: string
  ): Promise<void> => {
    try {
      const response = await axios.post(
        `https://${NLPRapidAPI.endpoint}/v1/translate`,
        {
          text: encode(valuesForTranslation.join(Translate.sentenceDelimiter)),
          to: argv.to,
          from: argv.from,
        },
        NLPRapidAPI.axiosConfig
      );

      const value = (response as NLPTranslateResponse).data.translated_text[argv.to];
      this.saveTranslation(decode(value), originalObject, saveTo);
    } catch (error) {
      this.printAxiosError(error as AxiosError, 'NLP Rapid API');
    }
  };
}
