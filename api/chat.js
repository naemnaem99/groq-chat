module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const key = process.env.GROQ_API_KEY
  const { prompt } = req.body

  if (!key) {
    res.status(200).json({ reply: '(mock) ' + prompt })
    return
  }

  const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + key
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }]
    })
  })

  const data = await groqRes.json()
  res.status(200).json({ reply: data.choices?.[0]?.message?.content || '(응답없음)' })
}
