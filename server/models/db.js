const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], default: 'other' },
  age: Number,
  weight: Number,
  height: Number,
  fitness_goal: { 
    type: String, 
    enum: ['weight_loss', 'muscle_gain', 'endurance', 'flexibility', 'general'],
    default: 'general' 
  },
  activity_level: {
    type: String,
    enum: ['sedentary', 'light', 'moderate', 'very_active', 'extra_active'],
    default: 'moderate'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const bmiRecordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  weight: { type: Number, required: true },
  height: { type: Number, required: true },
  bmi: { type: Number, required: true },
  category: { type: String, enum: ['Underweight', 'Normal', 'Overweight', 'Obese'] },
  recordedAt: { type: Date, default: Date.now }
});
bmiRecordSchema.index({ userId: 1, recordedAt: -1 });

const dietLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  calories_target: Number,
  calories_consumed: { type: Number, default: 0 },
  protein_g: { type: Number, default: 0 },
  carbs_g: { type: Number, default: 0 },
  fat_g: { type: Number, default: 0 },
  water_ml: { type: Number, default: 0 },
  notes: String,
  createdAt: { type: Date, default: Date.now }
});
dietLogSchema.index({ userId: 1, date: -1 });

const workoutExerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sets: { type: Number, default: 3 },
  reps: { type: String, default: '10' },
  rest: { type: Number, default: 60 },
  muscle: String
}, { _id: false });

const workoutPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: String,
  day_of_week: String,
  exercises: [workoutExerciseSchema],
  duration_minutes: { type: Number, default: 45 },
  intensity: { type: String, enum: ['light', 'moderate', 'high'], default: 'moderate' },
  createdAt: { type: Date, default: Date.now }
});
workoutPlanSchema.index({ userId: 1, day_of_week: 1 });

const chatHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
chatHistorySchema.index({ userId: 1, createdAt: -1 });

const commentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: String,
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

const blogPostSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: String,
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, enum: ['workout', 'nutrition', 'motivation', 'tips', 'general'], default: 'general' },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [commentSchema],
  image: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
blogPostSchema.index({ userId: 1, createdAt: -1 });
blogPostSchema.index({ category: 1, createdAt: -1 });

async function connectDB() {
  try {
    const mongoURL = process.env.MONGODB_URI || 'mongodb://localhost:27017/fitquest';
    await mongoose.connect(mongoURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

const User = mongoose.model('User', userSchema);
const BMIRecord = mongoose.model('BMIRecord', bmiRecordSchema);
const DietLog = mongoose.model('DietLog', dietLogSchema);
const WorkoutPlan = mongoose.model('WorkoutPlan', workoutPlanSchema);
const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);
const BlogPost = mongoose.model('BlogPost', blogPostSchema);

module.exports = {
  connectDB,
  User,
  BMIRecord,
  DietLog,
  WorkoutPlan,
  ChatHistory,
  BlogPost
};
