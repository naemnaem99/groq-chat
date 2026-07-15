require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
const key = process.env.GROQ_API_KEY
if (!key) return res.json({reply : '(mock)' + req.body.prompt})

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST", 
        headers: {
            "Content-Type": "application/json",
            "Authorization": 'Bearer'+ " " + key
        },
        body: JSON.stringify({model:'llama-3.1-8b-instant', messages: [{role:"user", content: req.body.prompt}]})
    })

    const data = await groqRes.json()
    res.json({reply : data.choices?.[0]?.message?.content || '(응답없음)'})
})

app.listen(3000, () => {
    console.log('Server is running on port 3000');
})
