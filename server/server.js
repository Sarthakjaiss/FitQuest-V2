require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { connectDB } = require('./models/db');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
const blogRoutes = require('./routes/blog');
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/blog', blogRoutes);

app.post('/api/chat', async (req, res) => {
  const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
  if (!OPENROUTER_KEY) {
    return res.status(500).json({ error: 'Server: OpenRouter API key not configured' });
  }

  try {
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', req.body, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
      },
      timeout: 30000,
      validateStatus: () => true,
    });

    if (response.status >= 200 && response.status < 300) {
      return res.status(response.status).json(response.data);
    }

    const errorMessage = JSON.stringify(response.data).toLowerCase();
    if (errorMessage.includes('no endpoints found') || errorMessage.includes('not a valid model id')) {
      const fallbackBody = { ...req.body, model: 'openai/gpt-3.5-turbo' };
      const fallbackResponse = await axios.post('https://openrouter.ai/api/v1/chat/completions', fallbackBody, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_KEY}`,
        },
        timeout: 30000,
        validateStatus: () => true,
      });

      if (fallbackResponse.status >= 200 && fallbackResponse.status < 300) {
        return res.status(fallbackResponse.status).json(fallbackResponse.data);
      }
      console.error('OpenRouter fallback error:', fallbackResponse.status, fallbackResponse.data);
      return res.status(fallbackResponse.status).json(fallbackResponse.data);
    }

    console.error('OpenRouter proxy error:', response.status, response.data);
    return res.status(response.status).json(response.data);
  } catch (error) {
    const apiErrorData = error.response?.data || error.message;
    console.error('OpenRouter proxy error:', apiErrorData);
    return res.status(error.response?.status || 500).json({ error: apiErrorData });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'FitQuest API is running', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

async function initApp() {
  await connectDB();
}

if (require.main === module) {
  initApp()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error('Failed to start server:', err);
      process.exit(1);
    });
} else {
  initApp().catch((err) => {
    console.error('Failed to initialize serverless app:', err);
  });
}

module.exports = app;
