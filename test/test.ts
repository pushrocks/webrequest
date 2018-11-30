import { expect, tap } from '@pushrocks/tapbundle';
import * as webrequest from '../ts/index'

tap.test('first test', async () => {
  console.log(webrequest.standardExport)
})

tap.start()
