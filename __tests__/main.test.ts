import {run} from '../src/main'
import * as core from '@actions/core'
import * as exec from '@actions/exec'
import github from '@actions/github'
import {beforeEach} from 'jest-circus'

let inputs = {} as any

beforeAll(() => {
  inputs.chart = 'someChart'
  inputs.repo = 'someRepo'
  inputs.helm = 'helm'
  inputs.args = 'some args'

  jest.spyOn(exec, 'exec').mockImplementation((): Promise<number> => {
    return Promise.resolve(0)
  })

  jest.spyOn(core, 'getInput').mockImplementation((name: string): string => {
    return inputs[name]
  })

  jest.spyOn(github, "context").mockImplementation(() => {
    return {
      repo: {
        owner: 'someOrg',
        repo: 'someRepo'
      },
      runNumber: 11,
      payload: {
        pull_request: {
          head: {
            ref: 'someBranch'
          }
        }
      }
    }
  })
})

beforeEach(() => {
  // Reset inputs
  inputs = {}
})

test('test runs', async () => {
  await expect(run()).resolves.not.toThrow
})
