import {ChatGPTAPI, ChatMessage} from 'chatgpt'
import * as core from '@actions/core'

export async function createChatGPTAPI(): Promise<ChatGPTAPI> {
  const api = new ChatGPTAPI({
    apiKey: process.env.OPENAI_API_KEY ?? '',
    debug: true
  })
  return api
}

function is503or504Error(err: Error): boolean {
  return err.message.includes('503') || err.message.includes('504')
}

export async function callChatGPT(
  api: ChatGPTAPI,
  content: string,
  retryOn503: number
): Promise<any> {
  let cnt = 0
  while (cnt++ <= retryOn503) {
    try {
      const response = await api.sendMessage(content)
      return response
    } catch (err: any) {
      if (!is503or504Error(err)) throw err
    }
  }
}

export function startConversation(api: ChatGPTAPI, retryOn503: number): any {
  return {
    api,
    retryOn503,
    async sendMessage(message: string, res: ChatMessage): Promise<any> {
      let cnt = 0
      while (cnt++ <= retryOn503) {
        try {
          const response = await api.sendMessage(message, {
            conversationId: res?.conversationId || undefined,
            parentMessageId: res?.id || undefined
          })
          return response
        } catch (err: any) {
          if (!is503or504Error(err)) throw err
          core.warning(`got "${err}", sleep for 10s now!`)
          await new Promise(r => setTimeout(r, 10000))
        }
      }
    }
  }
}
