require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./models/db');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

async function startServer() {
  try {
    await connectDB();

    const blogRoutes = require('./routes/blog');
    
    app.use('/api/auth', authRoutes);
    app.use('/api/user', userRoutes);
    app.use('/api/blog', blogRoutes);

    app.get('/api/health', (req, res) => {
      res.json({ status: 'OK', message: '💪 FitQuest API is running', timestamp: new Date().toISOString() });
    });

    if (process.env.NODE_ENV === 'production') {
      const clientDist = path.join(__dirname, '../client/dist');
      app.use(express.static(clientDist));
      app.use((req, res, next) => {
        if (req.method !== 'GET' || req.path.startsWith('/api')) return next();
        res.sendFile(path.join(clientDist, 'index.html'), (err) => (err ? next(err) : undefined));
      });
    }

    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({ error: 'Internal server error' });
    });

    app.listen(PORT, () => {
      console.log(`
  ██████╗ ██╗████████╗ ██████╗ ██╗   ██╗███████╗███████╗████████╗
  ██╔════╝ ██║╚══██╔══╝██╔═══██╗██║   ██║██╔════╝██╔════╝╚══██╔══╝
  ███████╗ ██║   ██║   ██║   ██║██║   ██║█████╗  ███████╗   ██║   
  ██╔════╝ ██║   ██║   ██║▄▄ ██║██║   ██║██╔══╝  ╚════██║   ██║   
  ██║      ██║   ██║   ╚██████╔╝╚██████╔╝███████╗███████║   ██║   
  ╚═╝      ╚═╝   ╚═╝    ╚══▀▀═╝  ╚═════╝ ╚══════╝╚══════╝   ╚═╝   

  🚀 Server running on http://localhost:${PORT}
  📦 Database: MongoDB
  🔌 Ready to accept connections
      `);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
