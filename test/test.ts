import { expect, tap } from '@pushrocks/tapbundle';
import * as webrequest from '../ts/index';

// test dependencies
import * as smartexpress from '@pushrocks/smartexpress';

let testServer: smartexpress.Server;

tap.test('setup test server', async () => {
  testServer = new smartexpress.Server({
    cors: false,
    forceSsl: false,
    port: 1234
  });

  testServer.addRoute('/apiroute1', new smartexpress.Handler("GET", (req, res) => {
    res.status(429);
    res.end();
  }));

  testServer
})

tap.test('first test', async (tools) => {
  console.log(webrequest)
})

tap.start()
