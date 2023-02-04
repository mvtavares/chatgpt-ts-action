import * as core from '@actions/core'
import 'isomorphic-fetch';
import {createChatGPTAPI} from './chatgpt-api'
import {runPRReview} from './mode/pr_review'
import {readFileSync} from 'fs'

async function run(): Promise<void> {
  try {
    core.debug("Initializando...")
    const ev = JSON.parse(
      readFileSync(`${process.env.GITHUB_EVENT_PATH}`, 'utf8')
    )
    const prNum = ev.pull_request.number
    core.debug(`PR number is: ${prNum}`)

    const mode = core.getInput('mode')
    core.debug(`Running mode: ${mode}`)

    const split = 'yolo'
    // Get current repo.
    const [owner, repo] = process.env.GITHUB_REPOSITORY
      ? process.env.GITHUB_REPOSITORY.split('/')
      : []

    // Create ChatGPT API
    const api = await createChatGPTAPI()

    if (mode == 'pr') {
      runPRReview(api, owner, repo, prNum, split)
    } else if (mode == 'issue') {
      throw 'Not implemented!'
    } else {
      throw `Invalid mode ${mode}`
    }
  } catch (error: any) {
    core.setFailed(error.message)
  }
}
run()