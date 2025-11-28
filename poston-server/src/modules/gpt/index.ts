import OpenAI from 'openai'

import cfg from '../../config.js'

const client = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: cfg.GPT_KEY,
})

export async function sendGPT(
  messages: unknown[],
  chunkCallback?: (chunk: string) => Promise<void>
): Promise<string> {
  try {
    const stream = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages:
        messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
      stream: true,
    })

    let fullContent = ''

    for await (const part of stream) {
      const token = part.choices[0].delta?.content
      if (token) {
        fullContent += token
        if (chunkCallback) {
          await chunkCallback(token)
        }
      }
    }

    const respMsg = {
      role: 'assistant',
      content: fullContent,
    }
    messages.push(respMsg)

    return fullContent
  } catch (error) {
    console.error('Error interacting with assistant:', error)
    throw error
  }
}
