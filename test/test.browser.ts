import { expect, tap } from '@pushrocks/tapbundle';
import * as webrequest from '../ts/index';

tap.test('first test', async tools => {
  const done = tools.defer();
  const response = await new webrequest.WebRequest().request([
    'https://lossless.com'
  ], {
    method: 'GET'
  }).catch(e => {
    done.resolve();
  });
  await done.promise;
});

tap.start();
