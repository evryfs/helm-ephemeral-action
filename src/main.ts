import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as github from '@actions/github'
import stringHash from '@sindresorhus/string-hash'
import {retry} from 'ts-retry'
const OUTPUT_KEY_RELEASE_NAME = 'releaseName'
const STATE_KEY_RELEASE_NAME = OUTPUT_KEY_RELEASE_NAME

export async function run(): Promise<void> {
  try {
    if (isCleanupPhase()) {
      await cleanup()
    } else {
      await installChart()
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

async function installChart(): Promise<void> {
  const repo: string = core.getInput('repo', {required: true})
  const chart: string = core.getInput('chart', {required: true})
  const helmCmd: string = core.getInput('helm', {required: true})
  const args: string = core.getInput('args', {required: false})

  const releaseName = getReleaseName(chart)
  core.saveState(STATE_KEY_RELEASE_NAME, releaseName)
  core.setOutput(OUTPUT_KEY_RELEASE_NAME, releaseName)

  await exec.exec(
    helmCmd,
    ['install', '--repo', repo, releaseName, chart].concat(args.split(' '))
  )
}

function isCleanupPhase(): boolean {
  return core.getState(STATE_KEY_RELEASE_NAME).length > 0
}

async function cleanup(): Promise<void> {
  const releaseName = core.getState(STATE_KEY_RELEASE_NAME)
  if (releaseName) {
    await retry(
      async () => {
        return await exec.exec(core.getInput('helm'), ['del', releaseName])
      },
      {maxTry: 3, delay: 1000}
    )
  }
}

function getReleaseName(chart: string): string {
  const prefix = `${chart}-${github.context.repo.repo}`
  const suffix = `${github.context.workflow}-${github.context.job}-${github.context.runId}-${github.context.runNumber}`

  return `${prefix}-${stringHash(suffix)}`.toLowerCase()
}

run()
