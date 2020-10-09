import { expect, tap } from '@pushrocks/tapbundle';
import * as webrequest from '../ts/index';

// test dependencies
import * as smartexpress from '@pushrocks/smartexpress';

let testServer: smartexpress.Server;

tap.test('setup test server', async () => {
  testServer = new smartexpress.Server({
    cors: false,
    forceSsl: false,
    port: 2345,
  });

  testServer.addRoute(
    '/apiroute1',
    new smartexpress.Handler('GET', (req, res) => {
      res.status(429);
      res.end();
    })
  );

  testServer.addRoute(
    '/apiroute2',
    new smartexpress.Handler('GET', (req, res) => {
      res.status(500);
      res.end();
    })
  );

  testServer.addRoute(
    '/apiroute3',
    new smartexpress.Handler('GET', (req, res) => {
      res.status(200);
      res.send({
        hithere: 'hi',
      });
    })
  );

  await testServer.start();
});

tap.test('first test', async (tools) => {
  const response = await new webrequest.WebRequest().getJson([
    'http://localhost:2345/apiroute1',
    'http://localhost:2345/apiroute2',
    'http://localhost:2345/apiroute4',
    'http://localhost:2345/apiroute3',
  ]);

  const response2 = await new webrequest.WebRequest().getJson('http://localhost:2345/apiroute3');

  console.log(response);
  console.log(response2);

  expect(response).property('hithere').to.equal('hi');
  expect(response2).property('hithere').to.equal('hi');
});

tap.test('tear down server', async () => {
  testServer.stop();
});

tap.start();
