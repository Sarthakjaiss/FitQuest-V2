const express = require('express');
const { BMIRecord, DietLog, WorkoutPlan, ChatHistory } = require('../models/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// ─── BMI Records ─────────────────────────────────────────────────────────────
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

// ─── Diet Logs ────────────────────────────────────────────────────────────────
router.post('/diet', authenticateToken, async (req, res) => {
  try {
    const { date, calories_target, calories_consumed, protein_g, carbs_g, fat_g, water_ml, notes } = req.body;
    
    // Check if log exists for this date
    let log = await DietLog.findOne({ userId: req.user.id, date });
    
    if (log) {
      // Update existing
      log = await DietLog.findByIdAndUpdate(
        log._id,
        { calories_target, calories_consumed, protein_g, carbs_g, fat_g, water_ml, notes },
        { new: true }
      );
    } else {
      // Create new
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

// ─── Workout Plans ────────────────────────────────────────────────────────────
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

// ─── Chat History ─────────────────────────────────────────────────────────────
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

router.delete('/chat', authenticateToken, async (req, res) => {
  try {
    await ChatHistory.deleteMany({ userId: req.user.id });
    res.json({ message: 'Chat cleared' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
