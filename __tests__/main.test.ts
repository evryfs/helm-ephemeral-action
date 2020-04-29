import {run} from '../src/main'
import * as core from '@actions/core'
import * as exec from '@actions/exec'
import {beforeEach} from 'jest-circus'

let inputs = {} as any

beforeAll(() => {
  inputs.chart = 'someChart'
  inputs.repo = 'someRepo'
  inputs.helm = 'helm'
  inputs.args = 'some args'

  jest.spyOn(exec, 'exec').mockImplementation(
    (): Promise<number> => {
      return Promise.resolve(0)
    }
  )

  jest.spyOn(core, 'getInput').mockImplementation((name: string): string => {
    return inputs[name]
  })
})

beforeEach(() => {
  // Reset inputs
  inputs = {}
})

test('test runs', async () => {
  process.env['GITHUB_REPOSITORY'] = 'someOrg/someRepo'
  process.env['GITHUB_RUN_NUMBER'] = '11'
  await expect(run()).resolves.not.toThrow
})
