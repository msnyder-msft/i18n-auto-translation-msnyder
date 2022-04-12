import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { decode, encode } from 'html-entities';
import { v4 as uuid } from 'uuid';
import { argv } from '../cli';
import { AzureTranslateResponse, JSONObj } from '../payload';
import { Translate } from '../translate';

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function replaceAll(str: string, find: string, replace: string) {
  return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

export class AzureOfficialAPI extends Translate {
  private static readonly endpoint: string = 'api.cognitive.microsofttranslator.com';
  private static readonly axiosConfig: AxiosRequestConfig = {
    headers: {
      'Ocp-Apim-Subscription-Key': argv.key,
      'Ocp-Apim-Subscription-Region': argv.location,
      'Content-type': 'application/json',
      'X-ClientTraceId': uuid(),
    },
    params: {
      'api-version': '3.0',
      from: argv.from,
      to: argv.to,
    },
    responseType: 'json',
  };

  protected callTranslateAPI = (
    valuesForTranslation: string[],
    originalObject: JSONObj,
    saveTo: string
  ): void => {
    axios
      .post(
        `https://${AzureOfficialAPI.endpoint}/translate`,
        [{ text: encode(valuesForTranslation.join(Translate.sentenceDelimiter)) }],
        AzureOfficialAPI.axiosConfig
      )
      .then((response) => {
        let value = (response as AzureTranslateResponse).data[0].translations[0].text;
        // fix bug where the strings come back with an extra space in the delimiter sometimes
        value = replaceAll(value, '| *|', Translate.sentenceDelimiter);
        this.saveTranslation(decode(value), originalObject, saveTo);
      })
      .catch((error) => this.printAxiosError(error as AxiosError, 'Azure Official API'));
  };
}
