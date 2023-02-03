import * as core from '@actions/core'
import {genReviewPRPrompt, genReviewPRSplitedPrompt} from '../prompt'
import {callChatGPT, startConversation} from '../chatgpt-api'
import {Octokit} from '@octokit/action'
import * as github from '@actions/github'

const octokit = new Octokit()
const context = github.context

/* eslint-disable  @typescript-eslint/no-explicit-any */
export async function runPRReview(
  api: any,
  owner: string,
  repo: string,
  pull_number: number,
  split: string
): Promise<void> {
  const {
    data: {title, body}
  } = await octokit.pulls.get({
    owner,
    repo,
    pull_number
  })
  const {data: diff} = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number,
    mediaType: {
      format: 'diff'
    }
  })
  let reply: string
  if (split === 'yolo') {
    // check this line
    const prompt = genReviewPRPrompt(title, body ?? '', JSON.stringify(diff))
    core.info(`The prompt is: ${prompt}`)
    const response = await callChatGPT(api, prompt, 5)
    reply = response
  } else {
    reply = ''
    const {welcomePrompts, diffPrompts, endPrompt} = genReviewPRSplitedPrompt(
      title,
      body ?? '',
      JSON.stringify(diff),
      65536
    )
    const conversation = startConversation(api, 5)
    let cnt = 0
    const prompts = welcomePrompts.concat(diffPrompts)
    prompts.push(endPrompt)
    let response = null
    for (const prompt of prompts) {
      core.info(`Sending ${prompt}`)
      response = await conversation.sendMessage(prompt, response)
      core.info(`Received ${response}`)
      reply += `**ChatGPT#${++cnt}**: ${response}\n\n`
      // Wait for 10s
      await new Promise(r => setTimeout(r, 10000))
    }
    await octokit.issues.createComment({
      ...context.repo,
      issue_number: pull_number,
      body: reply
    })
  }
}
