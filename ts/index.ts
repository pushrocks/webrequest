import * as plugins from './webrequest.plugins';

type TRequestHistoryEntry = 'timedout' | '429' | '5xx';

/**
 * web request
 */
export class WebRequest {
  /**
   * gets json
   */
  async getJson(url: string | string[]) {}

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

    const requestHistory: TRequestHistoryEntry[] = []; // keep track of the request history

    const doHistoryCheck = async ( // check history for a 
      historyEntryTypeArg: TRequestHistoryEntry
    ) => {
      requestHistory.push(historyEntryTypeArg);
      await plugins.smartdelay.delayFor(
        Math.floor(Math.random() * (2000 - 1000 +1)) + 1000
      ); // wait between 1 and 10 seconds

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
      const response = await fetch(urlToUse, {
        method: optionsArg.method,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (response.status >= 200 && response.status < 200) {
        return JSON.parse(await response.text());
      } else if (response.status === 429) {
        await doHistoryCheck('429');
        return await doRequest(allUrls[usedUrlIndex]);
      } else if (response.status >= 500 && response.status < 600) {
        await doHistoryCheck('5xx');
        return await doRequest(allUrls[usedUrlIndex]);
      }
    };

    const finalResponse = await doRequest(urlArg[usedUrlIndex]);
  }
}
