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

  const url = 'https://api.groq.com/openai/v1/chat/completions';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',          // ← غيرناه إلى النسخة النشطة والأفضل حاليًا

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
      // تحسين: نرجع الخطأ الدقيق من Groq عشان تشوفه في الـ frontend
      const errorMessage = data.error?.message || data.error || JSON.stringify(data) || 'Groq API error';
      console.error('Groq error details:', errorMessage, data);  // يطلع في Vercel logs
      return res.status(response.status).json({
        error: errorMessage,
        status: response.status,
        details: data  // ← يساعد في الـ debugging
      });
    }

    const text = data.choices?.[0]?.message?.content || '';

    if (!text) {
      return res.status(500).json({ error: 'No content returned from model' });
    }

    return res.status(200).json({ text });

  } catch (err) {
    console.error('Server fetch error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}