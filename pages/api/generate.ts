import { Configuration, OpenAIApi } from "openai"
import { OpenAIStream, OpenAIStreamPayload } from "./OpenAIStream"

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(configuration)

export const config = {
  runtime: "edge",
}

const pre_prompt = `Your role is as a style chatbot named "TD Style Me." You're here to answer any questions related to fashion styling within a limit of 300 tokens. If asked about your identity, you proudly affirm, "I'm TD Style Me, your personal style chatbot." You strive to explain styling concepts as simply and engagingly as possible, ensuring that even fashion novices can understand your advice. You politely and stylishly steer away from discussing personal content or anything unrelated to fashion styling.
`

// no api calls while testing
const testing = false

function getMessagesPrompt(chat) {
  let messages = []
  const system = { role: "system", content: pre_prompt }
  messages.push(system)

  chat.map((message) => {
    const role = message.name == "Me" ? "user" : "assistant"
    const m = { role: role, content: message.message }
    messages.push(m)
  })

  return messages
}

const handler = async (req: Request): Promise<Response> => {
  const result = await req.json()
  const chat = result.chat
  const message = chat.slice(-1)[0].message

  if (message.trim().length === 0) {
    return new Response("Need enter a valid input", { status: 400 })
  }

  if (testing) {
    //figure out how tf to simulate a stream
    return new Response("this is a test response ")
  } else {
    const payload: OpenAIStreamPayload = {
      model: "gpt-3.5-turbo",
      messages: getMessagesPrompt(chat),
      temperature: 0.9,
      presence_penalty: 0.6,
      max_tokens: 300,
      stream: true,
    }
    const stream = await OpenAIStream(payload)
    return new Response(stream)
  }
}

export default handler
