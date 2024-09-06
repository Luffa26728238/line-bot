const express = require("express")
const line = require("@line/bot-sdk")
const fetch = require("node-fetch")
require("dotenv").config()

const app = express()

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
}

const client = new line.Client(config)

app.post("/callback", line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err)
      res.status(500).end()
    })
})

async function handleEvent(event) {
  if (event.type !== "message" || event.message.type !== "text") {
    return Promise.resolve(null)
  }

  const userMessage = event.message.text

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill",
      {
        headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}` },
        method: "POST",
        body: JSON.stringify({ inputs: userMessage }),
      }
    )
    const result = await response.json()
    const aiReply = result[0].generated_text

    return client.replyMessage(event.replyToken, {
      type: "text",
      text: aiReply,
    })
  } catch (error) {
    console.error("Error:", error)
    return client.replyMessage(event.replyToken, {
      type: "text",
      text: "抱歉，我現在無法回答。請稍後再試。",
    })
  }
}

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`listening on ${port}`)
})
