require("dotenv").config()
const fetch = require("node-fetch")

async function go() {
  const response = await fetch(
    "https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill",
    {
      headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}` },
      method: "POST",
      body: JSON.stringify({ inputs: "你好" }),
    }
  )
  const result = await response.json()
  const aiReply = result[0].generated_text

  console.log(aiReply)
}

go()
