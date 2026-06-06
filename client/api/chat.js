// Serverless proxy for OpenRouter chat completions.
// Deploy this with Vercel. Keep OPENROUTER_API_KEY in Vercel env vars.

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
  if (!OPENROUTER_KEY) {
    return res.status(500).json({ error: 'Server: OpenRouter API key not configured' });
  }

  try {
    const forwarded = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
      },
      body: JSON.stringify(req.body),
    });

    if (forwarded.ok) {
      const data = await forwarded.json();
      return res.status(200).json(data);
    }

    const errorData = await forwarded.json().catch(() => ({}));
    const errorMessage = JSON.stringify(errorData).toLowerCase();
    if (errorMessage.includes('no endpoints found') || errorMessage.includes('not a valid model id')) {
      const fallbackBody = { ...req.body, model: 'openai/gpt-3.5-turbo' };
      const fallbackResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_KEY}`,
        },
        body: JSON.stringify(fallbackBody),
      });
      const fallbackData = await fallbackResponse.json().catch(() => ({}));
      return res.status(fallbackResponse.ok ? 200 : 502).json(fallbackData);
    }

    return res.status(502).json(errorData);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
};
