export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { systemPrompt, userPrompt } = req.body;

  if (!systemPrompt || !userPrompt) {
    return res.status(400).json({ error: 'Missing systemPrompt or userPrompt' });
  }

  // غيّر هنا إلى اسم المتغير الجديد في Vercel
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
        'Authorization': `Bearer ${apiKey}`,   // ← مهم: Groq يستخدم Bearer token
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',     // ← أفضل نموذج مجاني قوي حاليًا
        // أو جرب: 'gemma2-27b-it' أو 'mixtral-8x7b-32768'

        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: userPrompt }
        ],

        temperature: 0.3,
        max_tokens: 1000,          // ← maxOutputTokens → max_tokens
        // top_p: 0.9,             // اختياري إذا تبي
        // stream: false           // لو تبي streaming لاحقًا
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || 'Groq API error'
      });
    }

    // استخراج النص من الرد (صيغة OpenAI)
    const text = data.choices?.[0]?.message?.content || '';

    return res.status(200).json({ text });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}