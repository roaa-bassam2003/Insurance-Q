export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { systemPrompt, userPrompt } = req.body;

  if (!systemPrompt || !userPrompt) {
    return res.status(400).json({ error: 'Missing systemPrompt or userPrompt' });
  }

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'GROQ_API_KEY is not set in environment variables' });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Groq API error', details: data });
    }

    const text = data.choices?.[0]?.message?.content || '';
    if (!text) return res.status(500).json({ error: 'No content returned from model' });

    return res.status(200).json({ text });

  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}