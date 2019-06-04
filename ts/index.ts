import * as plugins from './webrequest.plugins';

/**
 * web request
 */
export class WebRequest {
  /**
   * gets json
   */
  public async getJson(urlArg: string | string[], requestBody?) {
    const response = await this.request(urlArg, {
      body: requestBody,
      method: 'GET'
    });

  }

  /**
   * postJson
   */
  postJson() {}

  /**
   * put js
   */
  putJson() {}

  /**
   *
   */
  async request(
    urlArg: string | string[],
    optionsArg: {
      method: 'GET' | 'POST' | 'PUT' | 'DELETE';
      body?: any;
    }
  ) {
    let allUrls: string[];
    let usedUrlIndex = 0;

    // determine what we got
    if (Array.isArray(urlArg)) {
      allUrls = urlArg;
    } else {
      allUrls = [urlArg];
    }

    const requestHistory: string[] = []; // keep track of the request history

    const doHistoryCheck = async ( // check history for a 
      historyEntryTypeArg: string
    ) => {
      requestHistory.push(historyEntryTypeArg);
      if (historyEntryTypeArg === '429') {
        console.log('got 429, so waiting a little bit.')
        await plugins.smartdelay.delayFor(
          Math.floor(Math.random() * (2000 - 1000 +1)) + 1000
        ); // wait between 1 and 10 seconds
      }

      let numOfHistoryType = 0;
      for (const entry of requestHistory) {
        if (entry === historyEntryTypeArg) numOfHistoryType++;
      }
      if (numOfHistoryType > (2 * allUrls.length * usedUrlIndex)) {
        usedUrlIndex++;
      }
    };

    // lets go recursive
    const doRequest = async (urlToUse: string) => {
      if (!urlToUse) {
        throw new Error('request failed permanently');
      }
      
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

    const finalResponse: Response = await doRequest(urlArg[usedUrlIndex]);
    console.log(finalResponse);
    return JSON.parse(await finalResponse.text());
  }
}
