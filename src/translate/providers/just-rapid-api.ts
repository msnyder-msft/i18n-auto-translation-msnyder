import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { decode, encode } from 'html-entities';
import { argv } from '../cli';
import { JSONObj, JustTranslateResponse } from '../payload';
import { Translate } from '../translate';

export class JustRapidAPI extends Translate {
  private static readonly endpoint: string = 'just-translated.p.rapidapi.com';

  protected callTranslateAPI = async (
    valuesForTranslation: string[],
    originalObject: JSONObj,
    saveTo: string
  ): Promise<void> => {
    try {
      const axiosConfig: AxiosRequestConfig = {
        headers: {
          'X-RapidAPI-Host': JustRapidAPI.endpoint,
          'X-RapidAPI-Key': argv.key,
        },
        params: {
          lang: `${argv.from}-${argv.to}`,
          text: encode(valuesForTranslation.join(Translate.sentenceDelimiter)),
        },
        responseType: 'json',
      };
      const response = await axios.get(`https://${JustRapidAPI.endpoint}/`, axiosConfig);
      const value = (response as JustTranslateResponse).data.text[0];
      this.saveTranslation(decode(value), originalObject, saveTo);
    } catch (error) {
      this.printAxiosError(error as AxiosError, 'Just Rapid API');
    }
  };
}
