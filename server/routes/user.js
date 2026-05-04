const express = require('express');
const { BMIRecord, DietLog, WorkoutPlan, ChatHistory } = require('../models/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const buildSystemPrompt = (user) => `You are FitBot, an elite personal fitness coach and nutritionist AI embedded in the FitQuest fitness app.

USER PROFILE:
- Name: ${user?.name || 'Athlete'}
- Gender: ${user?.gender || 'not specified'}
- Age: ${user?.age || 'not specified'}
- Weight: ${user?.weight ? user.weight + ' kg' : 'not specified'}
- Height: ${user?.height ? user.height + ' cm' : 'not specified'}
- Fitness Goal: ${user?.fitness_goal?.replace('_', ' ') || 'general fitness'}
- Activity Level: ${user?.activity_level?.replace('_', ' ') || 'moderate'}

YOUR ROLE:
You provide personalized, science-based fitness and nutrition advice. Be energetic, motivating, and specific. Always consider the user's profile when giving advice. Use metrics and numbers whenever possible.

GUIDELINES:
- Give concrete, actionable workout plans with sets, reps, rest times
- Provide specific calorie and macro recommendations based on their stats
- Suggest exercises appropriate for their fitness level and goal
- Use encouraging language and celebrate their commitment
- Format workout plans clearly with bullet points or numbered lists
- When asked for a full workout plan, structure it by day (Mon-Sun)
- Include warm-up and cool-down recommendations
- Mention injury prevention and proper form tips
- Keep responses focused and practical

PERSONALITY: Enthusiastic, knowledgeable, supportive. Like a world-class personal trainer who genuinely cares about the user's success.`;

const callGemini = async ({ user, content, history }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { ok: false, status: 500, error: 'Gemini API key is not configured on the server' };
  }

  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const conversation = history
    .filter((msg) => msg && typeof msg.content === 'string' && msg.content.trim())
    .map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

  conversation.push({ role: 'user', parts: [{ text: content }] });

  const geminiResponse = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: {
        role: 'system',
        parts: [{ text: buildSystemPrompt(user) }]
      },
      contents: conversation,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000
      }
    })
  });

  const data = await geminiResponse.json();
  if (!geminiResponse.ok) {
    console.error('Gemini API Error:', data);
    return {
      ok: false,
      status: geminiResponse.status || 502,
      error: data?.error?.message || `Gemini API error: ${geminiResponse.status}`
    };
  }

  const reply = data?.candidates?.[0]?.content?.parts
    ?.map((part) => part?.text || '')
    .join('')
    .trim();

  if (!reply) {
    return { ok: false, status: 502, error: 'Gemini returned an empty response' };
  }

  return { ok: true, reply };
};

const callOllama = async ({ user, content, history }) => {
  const model = process.env.OLLAMA_MODEL || 'llama3.1:8b';
  const baseUrl = (process.env.OLLAMA_URL || 'http://localhost:11434').replace(/\/$/, '');
  const endpoint = `${baseUrl}/api/chat`;

  const messages = [
    { role: 'system', content: buildSystemPrompt(user) },
    ...history
      .filter((msg) => msg && typeof msg.content === 'string' && msg.content.trim())
      .map((msg) => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      })),
    { role: 'user', content }
  ];

  const ollamaResponse = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages,
      stream: false
    })
  });

  const data = await ollamaResponse.json();
  if (!ollamaResponse.ok) {
    console.error('Ollama API Error:', data);
    return {
      ok: false,
      status: ollamaResponse.status || 502,
      error: data?.error || `Ollama API error: ${ollamaResponse.status}`
    };
  }

  const reply = data?.message?.content?.trim();
  if (!reply) {
    return { ok: false, status: 502, error: 'Ollama returned an empty response' };
  }

  return { ok: true, reply };
};

router.post('/bmi', authenticateToken, async (req, res) => {
  try {
    const { weight, height } = req.body;
    const bmi = weight / ((height / 100) ** 2);
    let category = '';
    if (bmi < 18.5) category = 'Underweight';
    else if (bmi < 25) category = 'Normal';
    else if (bmi < 30) category = 'Overweight';
    else category = 'Obese';

    const record = await BMIRecord.create({
      userId: req.user.id,
      weight,
      height,
      bmi: parseFloat(bmi.toFixed(2)),
      category
    });

    res.status(201).json({ record });
  } catch (err) {
    console.error('BMI save error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/bmi', authenticateToken, async (req, res) => {
  try {
    const records = await BMIRecord.find({ userId: req.user.id })
      .sort({ recordedAt: -1 })
      .limit(10);
    res.json({ records });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/diet', authenticateToken, async (req, res) => {
  try {
    const { date, calories_target, calories_consumed, protein_g, carbs_g, fat_g, water_ml, notes } = req.body;
    
    let log = await DietLog.findOne({ userId: req.user.id, date });
    
    if (log) {
      log = await DietLog.findByIdAndUpdate(
        log._id,
        { calories_target, calories_consumed, protein_g, carbs_g, fat_g, water_ml, notes },
        { new: true }
      );
    } else {
      log = await DietLog.create({
        userId: req.user.id,
        date,
        calories_target,
        calories_consumed,
        protein_g,
        carbs_g,
        fat_g,
        water_ml,
        notes
      });
    }

    res.status(log._id ? 200 : 201).json({ log });
  } catch (err) {
    console.error('Diet log error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/diet', authenticateToken, async (req, res) => {
  try {
    const logs = await DietLog.find({ userId: req.user.id })
      .sort({ date: -1 })
      .limit(30);
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/workouts', authenticateToken, async (req, res) => {
  try {
    const plans = await WorkoutPlan.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    res.json({ plans });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/workouts', authenticateToken, async (req, res) => {
  try {
    const { name, description, day_of_week, exercises, duration_minutes, intensity } = req.body;
    
    const plan = await WorkoutPlan.create({
      userId: req.user.id,
      name,
      description,
      day_of_week,
      exercises,
      duration_minutes,
      intensity
    });

    res.status(201).json({ plan });
  } catch (err) {
    console.error('Workout save error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/workouts/:id', authenticateToken, async (req, res) => {
  try {
    await WorkoutPlan.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/chat', authenticateToken, async (req, res) => {
  try {
    const messages = await ChatHistory.find({ userId: req.user.id })
      .sort({ createdAt: 1 })
      .limit(100);
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/chat', authenticateToken, async (req, res) => {
  try {
    const { role, content } = req.body;
    const message = await ChatHistory.create({
      userId: req.user.id,
      role,
      content
    });
    res.status(201).json({ id: message._id });
  } catch (err) {
    console.error('Chat save error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/chat/ai', authenticateToken, async (req, res) => {
  try {
    const { content, history = [] } = req.body;
    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const provider = (process.env.LLM_PROVIDER || 'ollama').toLowerCase();
    const llmResult = provider === 'gemini'
      ? await callGemini({ user: req.user, content, history })
      : await callOllama({ user: req.user, content, history });

    if (!llmResult.ok) {
      return res.status(llmResult.status || 502).json({ error: llmResult.error || 'AI provider error' });
    }

    res.json({ reply: llmResult.reply });
  } catch (err) {
    console.error('AI chat error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/chat', authenticateToken, async (req, res) => {
  try {
    await ChatHistory.deleteMany({ userId: req.user.id });
    res.json({ message: 'Chat cleared' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
