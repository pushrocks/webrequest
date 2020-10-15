import * as plugins from './webrequest.plugins';

/**
 * web request
 */
export class WebRequest {
  private static polyfillsLoaded = false;
  public static loadNeededPolyfills() {
    const smartenv = new plugins.smartenv.Smartenv();
    if (!smartenv.isBrowser && !this.polyfillsLoaded) {
      this.polyfillsLoaded = true;
      globalThis.fetch = smartenv.getSafeNodeModule('node-fetch');
    }
  }

  constructor() {
    WebRequest.loadNeededPolyfills();
  }

  public async getJson(urlArg: string | string[]) {
    const response: Response = await this.request(urlArg, {
      method: 'GET',
    });
    const responseText = await response.text();
    const responseResult = plugins.smartjson.parse(responseText);
    return responseResult;
  }

  /**
   * postJson
   */
  public async postJson(urlArg: string, requestBody?: any) {
    const response: Response = await this.request(urlArg, {
      body: plugins.smartjson.stringify(requestBody),
      method: 'POST',
    });
    const responseText = await response.text();
    const responseResult = plugins.smartjson.parse(responseText);
    return responseResult;
  }

  /**
   * put js
   */
  public async putJson(urlArg: string, requestBody?: any) {
    const response: Response = await this.request(urlArg, {
      body: plugins.smartjson.stringify(requestBody),
      method: 'PUT',
    });
    const responseText = await response.text();
    const responseResult = plugins.smartjson.parse(responseText);
    return responseResult;
  }

  /**
   * put js
   */
  public async deleteJson(urlArg: string) {
    const response: Response = await this.request(urlArg, {
      method: 'GET',
    });
    const responseText = await response.text();
    const responseResult = plugins.smartjson.parse(responseText);
    return responseResult;
  }

  /**
   * a fault tolerant request
   */
  public async request(
    urlArg: string | string[],
    optionsArg: {
      method: 'GET' | 'POST' | 'PUT' | 'DELETE';
      body?: any;
    }
  ): Promise<Response> {
    let allUrls: string[];
    let usedUrlIndex = 0;

    // determine what we got
    if (Array.isArray(urlArg)) {
      allUrls = urlArg;
    } else {
      allUrls = [urlArg];
    }

    const requestHistory: string[] = []; // keep track of the request history

    const doHistoryCheck = async (
      // check history for a
      historyEntryTypeArg: string
    ) => {
      requestHistory.push(historyEntryTypeArg);
      if (historyEntryTypeArg === '429') {
        console.log('got 429, so waiting a little bit.');
        await plugins.smartdelay.delayFor(Math.floor(Math.random() * (2000 - 1000 + 1)) + 1000); // wait between 1 and 10 seconds
      }

      let numOfHistoryType = 0;
      for (const entry of requestHistory) {
        if (entry === historyEntryTypeArg) numOfHistoryType++;
      }
      if (numOfHistoryType > 2 * allUrls.length * usedUrlIndex) {
        usedUrlIndex++;
      }
    };

    // lets go recursive
    const doRequest = async (urlToUse: string) => {
      if (!urlToUse) {
        throw new Error('request failed permanently');
      }
      console.log(`Getting ${urlToUse} with method ${optionsArg.method}`);
      const response = await fetch(urlToUse, {
        method: optionsArg.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: optionsArg.body,
      });
      console.log(`${urlToUse} answers with status: ${response.status}`);

      if (response.status >= 200 && response.status < 300) {
        return response;
      } else {
        // lets perform a history check to determine failed urls
        await doHistoryCheck(response.status.toString());
        // lets fire the request
        const result = await doRequest(allUrls[usedUrlIndex]);
        return result;
      }
    };

    const finalResponse: Response = await doRequest(allUrls[usedUrlIndex]);
    return finalResponse;
  }
}
