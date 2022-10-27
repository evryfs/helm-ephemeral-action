import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as github from '@actions/github'
import stringHash from '@sindresorhus/string-hash'
import _ from 'lodash'

const OUTPUT_KEY_RELEASE_NAME = 'releaseName'
const STATE_KEY_RELEASE_NAME = OUTPUT_KEY_RELEASE_NAME
// hack - to leave some room for suffixes in the chart
const MAX_RELEASE_NAME_LENGTH = 53 - 19

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
    await exec.exec(core.getInput('helm'), ['del', releaseName], {
      ignoreReturnCode: true
    })
  }
}

function getReleaseName(chart: string): string {
  const prefix = `${chart}-${github.context.repo.repo}`
  const suffix = `${github.context.workflow}-${github.context.job}-${github.context.runId}-${github.context.runNumber}`
  const fullName = `${prefix}-${stringHash(suffix)}`.toLowerCase()

  const truncated =
    fullName.length > MAX_RELEASE_NAME_LENGTH
      ? fullName.substring(fullName.length - MAX_RELEASE_NAME_LENGTH)
      : fullName

  return _.trimStart(truncated, '-')
}

run()
