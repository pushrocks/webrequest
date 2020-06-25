import * as plugins from './webrequest.plugins';

/**
 * web request
 */
export class WebRequest {
  private static polyfillsLoaded = false;
  public static loadNeededPolyfills() {
    if (!this.polyfillsLoaded) {
      this.polyfillsLoaded = true;
      // tslint:disable-next-line: no-eval
      const loadFetchPolyfill = eval(`globalThis.fetch = require('node-fetch')`);
      loadFetchPolyfill();
    }
  }

  constructor() {
    WebRequest.loadNeededPolyfills();
  }

  public async getJson(urlArg: string | string[]) {
    const response: Response = await this.request(urlArg, {
      method: 'GET'
    });
    return response.json();
  }

  /**
   * postJson
   */
  public async postJson(urlArg: string, requestBody?: any) {
    const response: Response = await this.request(urlArg, {
      body: JSON.stringify(requestBody),
      method: 'POST'
    });
    return response.json();
  }

  /**
   * put js
   */
  public async putJson(urlArg: string, requestBody?: any) {
    const response: Response = await this.request(urlArg, {
      body: JSON.stringify(requestBody),
      method: 'PUT'
    });
    return response.json();
  }

  /**
   * put js
   */
  public async deleteJson(urlArg: string) {
    const response: Response = await this.request(urlArg, {
      method: 'GET'
    });
    return response.json();
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
          'Content-Type': 'application/json'
        },
        body: optionsArg.body
      });
      console.log(`${urlToUse} answers with status: ${response.status}`);

      if (response.status >= 200 && response.status < 300) {
        return response;
      } else {
        await doHistoryCheck(response.status.toString());
        // tslint:disable-next-line: no-return-await
        return await doRequest(allUrls[usedUrlIndex]);
      }
    };

    const finalResponse: Response = await doRequest(allUrls[usedUrlIndex]);
    console.log(finalResponse);
    return finalResponse;
  }
}
