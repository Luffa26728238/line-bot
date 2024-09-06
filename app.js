const express = require("express")
const line = require("@line/bot-sdk")
const natural = require("natural")
require("dotenv").config()

const app = express()

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
}

const client = new line.Client(config)

const classifier = new natural.BayesClassifier()

classifier.addDocument("你好", "greeting")
classifier.addDocument("嗨", "greeting")
classifier.addDocument("再見", "farewell")
classifier.addDocument("拜拜", "farewell")
classifier.addDocument("天氣如何", "weather")
classifier.addDocument("今天天氣怎麼樣", "weather")
classifier.train()

app.post("/callback", line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err)
      res.status(500).end()
    })
})

function handleEvent(event) {
  if (event.type !== "message" || event.message.type !== "text") {
    return Promise.resolve(null)
  }

  const userMessage = event.message.text
  const category = classifier.classify(userMessage)
  let replyText

  switch (category) {
    case "greeting":
      replyText = "你好！歡迎你來到line測試機器人，我們後續會新增更多功能！。"
      break
    case "farewell":
      replyText = "再見！希望很快能再次見到你。"
      break
    case "weather":
      replyText = "今天天氣不錯，適合出門走走。"
      break
    default:
      replyText = "抱歉，我不太明白你的意思。能請你換個方式說明嗎？"
  }

  return client.replyMessage(event.replyToken, {
    type: "text",
    text: replyText,
  })
}

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`listening on ${port}`)
})
