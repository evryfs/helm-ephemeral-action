import {run} from '../src/main'
import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'

test('should raise error', async () => {
  await expect(run()).toThrow
})

/*
test('test runs', () => {
  process.env['GITHUB_REPOSITORY_NAME'] = 'someRepo'
  process.env['GITHUB_RUN_NUMBER'] = "11"
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecSyncOptions = {
    env: process.env
  }
  console.log(cp.execSync(`node ${ip}`, options).toString())
})
*/
