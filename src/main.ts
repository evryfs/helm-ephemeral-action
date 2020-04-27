import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as process from 'process'

const STATE_KEY_RELEASE_NAME = 'releaseName'

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

  const releaseName = getReleaseName(chart)
  core.saveState(STATE_KEY_RELEASE_NAME, releaseName)
  core.setOutput('releaseName', releaseName)

  await exec.exec(helmCmd, ['repo', 'add', 'repo', repo])
  await exec.exec(helmCmd, ['install', releaseName, `repo/${chart}`])
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
  const repo = process.env['GITHUB_REPOSITORY']!.split('/')[1]
  return `${chart}-${repo}-${process.env['GITHUB_RUN_NUMBER']}`
}

run()
