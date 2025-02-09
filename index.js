require("dotenv").config();
const express = require("express");
const line = require("@line/bot-sdk");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();

// 設定 Line Bot
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

const client = new line.Client(config);

// 設定 Google Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Webhook 入口
app.post("/callback", line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error("Error:", err);
      res.status(500).end();
    });
});

// 處理 Line 訊息
async function handleEvent(event) {
  if (event.type !== "message" || event.message.type !== "text") {
    return Promise.resolve(null);
  }

  const userMessage = event.message.text;

  try {
    const aiReply = await getGeminiResponse(userMessage);

    return client.replyMessage(event.replyToken, {
      type: "text",
      text: aiReply,
    });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return client.replyMessage(event.replyToken, {
      type: "text",
      text: "抱歉，我無法處理您的請求，請稍後再試。",
    });
  }
}

// 取得 Gemini AI 回應
async function getGeminiResponse(prompt) {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    console.log(response.text());
    return response.text();
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "AI 目前無法回應，請稍後再試。";
  }
}
getGeminiResponse("how are you ai!");
// 啟動伺服器
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
