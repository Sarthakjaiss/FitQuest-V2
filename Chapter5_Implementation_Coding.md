# Chapter 5: Implementation & Coding

## 5.1 Technologies Used

FitQuest is a full-stack web application built using modern web technologies to ensure scalability, performance, and a seamless user experience. The application is divided into two main parts: the client-side frontend and the server-side backend.

### 5.1.1 Frontend Technologies

The frontend is built using React, a popular JavaScript library for building user interfaces. The following technologies are used:

- **React 18.3.0**: The core framework for building the user interface components.
- **React Router DOM 6.23.0**: For client-side routing and navigation between different pages.
- **Axios 1.7.2**: For making HTTP requests to the backend API.
- **Recharts 2.12.7**: For creating interactive charts and graphs in the dashboard and analytics.
- **Framer Motion 11.2.10**: For smooth animations and transitions throughout the application.
- **Lucide React 0.383.0**: For consistent and modern iconography.
- **React Hot Toast 2.4.1**: For displaying user notifications and feedback.
- **Vite 5.2.11**: As the build tool and development server for fast development and optimized production builds.

### 5.1.2 Backend Technologies

The backend is built using Node.js and Express, providing a robust API for data management and user authentication.

- **Node.js**: The runtime environment for server-side JavaScript execution.
- **Express 4.18.3**: A minimal and flexible Node.js web application framework for building the REST API.
- **MongoDB 7.8.0**: A NoSQL database for storing user data, workout plans, nutrition logs, and blog posts.
- **Mongoose 7.8.0**: An ODM (Object Data Modeling) library for MongoDB, providing schema validation and easy data manipulation.
- **bcryptjs 2.4.3**: For hashing user passwords securely.
- **jsonwebtoken 9.0.2**: For implementing JWT-based authentication.
- **CORS 2.8.5**: For handling Cross-Origin Resource Sharing.
- **dotenv 16.4.5**: For managing environment variables.

### 5.1.3 Development Tools

- **Nodemon 3.1.0**: For automatic server restarts during development.
- **ESLint**: For code linting and maintaining code quality.

## 5.2 System Architecture

FitQuest follows a client-server architecture with the following components:

1. **Client Application**: A single-page application (SPA) built with React, responsible for the user interface and user interactions.
2. **REST API**: An Express.js server providing endpoints for data operations, user authentication, and business logic.
3. **Database**: MongoDB for persistent data storage.
4. **Authentication System**: JWT-based authentication with bcrypt for password hashing.

## 5.3 Modules and Components

The application is organized into several modules, each handling specific functionality:

### 5.3.1 Authentication Module

Handles user registration, login, and session management.

**Login Component (client/src/components/Auth/Login.jsx)**:

```jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Eye, EyeOff, Zap, Mail, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('All fields required');
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back, Athlete! 💪');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // ... rest of the component with form rendering
}
```

**Signup Component (client/src/components/Auth/Signup.jsx)**:

```jsx
// Multi-step registration form
export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    gender: 'male', age: '', weight: '', height: '',
    fitness_goal: 'general', activity_level: 'moderate',
  });

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const nextStep = e => {
    e.preventDefault();
    if (step === 1) {
      if (!form.name || !form.email || !form.password)
        return toast.error('Please fill all fields');
      if (form.password.length < 6)
        return toast.error('Password must be at least 6 characters');
    }
    setStep(2);
  };

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({ ...form, age: +form.age, weight: +form.weight, height: +form.height });
      toast.success('Account created! Let\'s get fit! 🚀');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // ... form rendering with two steps
}
```

**Backend Authentication Routes (server/routes/auth.js)**:

```javascript
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fitquest_super_secret_2024';

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, gender, age, weight, height, fitness_goal, activity_level } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      gender: gender || 'other',
      age: age || null,
      weight: weight || null,
      height: height || null,
      fitness_goal: fitness_goal || 'general',
      activity_level: activity_level || 'moderate'
    });

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({ message: 'Registration successful', token, user: userResponse });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ message: 'Login successful', token, user: userResponse });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

module.exports = router;
```

### 5.3.2 Dashboard Module

The main dashboard provides an overview of user's fitness data, quick actions, and progress tracking.

**Dashboard Component (client/src/components/Dashboard/Dashboard.jsx)**:

```jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Link } from 'react-router-dom';
import {
  Activity, Flame, Droplets, Target, TrendingUp,
  Dumbbell, Calculator, Bot, PlaySquare, ArrowRight,
  Award, Calendar, Zap
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';
import './Dashboard.css';

const QUICK_ACTIONS = [
  { to: '/bmi',     icon: Calculator, label: 'Check BMI',      color: '#00e5ff', bg: 'rgba(0,229,255,0.1)' },
  { to: '/diet',    icon: Flame,      label: 'Log Nutrition',  color: '#ff9f43', bg: 'rgba(255,159,67,0.1)' },
  { to: '/workout', icon: Dumbbell,   label: 'Plan Workout',   color: '#ff4757', bg: 'rgba(255,71,87,0.1)' },
  { to: '/chatbot', icon: Bot,        label: 'Ask AI Coach',   color: '#2ed573', bg: 'rgba(46,213,115,0.1)' },
  { to: '/videos',  icon: PlaySquare, label: 'Watch Videos',   color: '#a29bfe', bg: 'rgba(162,155,254,0.1)' },
];

const WEEKLY_DATA = [
  { day: 'Mon', calories: 2100, burned: 350 },
  { day: 'Tue', calories: 1850, burned: 420 },
  { day: 'Wed', calories: 2300, burned: 280 },
  { day: 'Thu', calories: 1980, burned: 510 },
  { day: 'Fri', calories: 2150, burned: 390 },
  { day: 'Sat', calories: 2500, burned: 600 },
  { day: 'Sun', calories: 1700, burned: 200 },
];

const TIPS = [
  '💧 Drink at least 8 glasses of water daily to optimize performance.',
  '😴 Aim for 7-9 hours of sleep — it\'s when your muscles actually grow.',
  '🥗 Eat protein within 30 minutes after your workout for faster recovery.',
  '🧘 Stretch for at least 10 minutes after every training session.',
  '📆 Rest days are not lazy days — they\'re essential for muscle recovery.',
];

export default function Dashboard() {
  const { user } = useAuth();
  const [tip] = useState(() => TIPS[Math.floor(Math.random() * TIPS.length)]);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening');
  }, []);

  const bmi = user?.weight && user?.height
    ? (user.weight / ((user.height / 100) ** 2)).toFixed(1)
    : null;
  const bmiCategory = bmi
    ? bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese'
    : null;

  const tdee = user?.weight && user?.age && user?.gender ? (() => {
    const bmrBase = user.gender === 'female'
      ? 447.593 + (9.247 * user.weight) + (3.098 * (user.height || 170)) - (4.330 * user.age)
      : 88.362 + (13.397 * user.weight) + (4.799 * (user.height || 175)) - (5.677 * user.age);
    const multipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, very_active: 1.725, extra_active: 1.9 };
    return Math.round(bmrBase * (multipliers[user.activity_level] || 1.55));
  })() : null;

  const radialData = [{ name: 'Progress', value: 72, fill: 'var(--accent)' }];

  // ... rest of the component with rendering logic
}
```

### 5.3.3 Community Module (Blog)

The community feature allows users to share fitness-related posts, tips, and experiences.

**Blog Component (client/src/components/Blog/Blog.jsx)**:

```jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Link } from 'react-router-dom';
import { Plus, Heart, MessageCircle, User, Calendar, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import './Blog.css';

const CATEGORIES = [
  { value: 'all', label: 'All Posts' },
  { value: 'workout', label: '🏋️ Workout' },
  { value: 'nutrition', label: '🥗 Nutrition' },
  { value: 'motivation', label: '🔥 Motivation' },
  { value: 'tips', label: '💡 Tips' },
  { value: 'general', label: '💬 General' },
];

export default function Blog() {
  const { user, api } = useAuth();
  const [posts, setPosts] = useState([]);
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [category, page]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = { page };
      if (category !== 'all') params.category = category;
      
      const { data } = await api.get('/blog/posts', { params });
      setPosts(data.posts);
      setTotalPages(data.pagination.pages);
    } catch (err) {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const likePost = async (postId) => {
    try {
      await api.post(`/blog/posts/${postId}/like`);
      fetchPosts();
      toast.success('Post updated');
    } catch {
      toast.error('Failed to like post');
    }
  };

  const deletePost = async (postId) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete(`/blog/posts/${postId}`);
      setPosts(posts.filter(p => p._id !== postId));
      toast.success('Post deleted');
    } catch {
      toast.error('Failed to delete post');
    }
  };

  // ... rest of the component with rendering
}
```

### 5.3.4 BMI Calculator Module

Calculates Body Mass Index and provides health recommendations.

### 5.3.5 Diet Calculator Module

Calculates daily caloric needs and macronutrient distribution.

### 5.3.6 Workout Planner Module

Allows users to create and manage workout plans.

### 5.3.7 Chatbot Module

Provides AI-powered fitness coaching and advice.

## 5.4 Algorithms Implemented

### 5.4.1 BMI Calculation Algorithm

The BMI (Body Mass Index) is calculated using the standard formula:

```
BMI = weight (kg) / [height (m)]²
```

Where height is converted from centimeters to meters by dividing by 100.

**Implementation in BMICalculator.jsx**:

```javascript
const calcBMI = () => {
  let w = parseFloat(weight), h = parseFloat(height);
  if (!w || !h || w <= 0 || h <= 0) return toast.error('Enter valid weight and height');
  if (unit === 'imperial') { w = w * 0.453592; h = h * 2.54; }
  const bmi = w / ((h / 100) ** 2);
  const cat = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';
  setResult({ bmi: bmi.toFixed(1), category: cat, weight: w, height: h });
};
```

### 5.4.2 BMR and TDEE Calculation Algorithm

The Basal Metabolic Rate (BMR) is calculated using the Mifflin-St Jeor Equation:

For men: BMR = 88.362 + (13.397 × weight in kg) + (4.799 × height in cm) - (5.677 × age in years)

For women: BMR = 447.593 + (9.247 × weight in kg) + (3.098 × height in cm) - (4.330 × age in years)

The Total Daily Energy Expenditure (TDEE) is then calculated by multiplying BMR by an activity level multiplier:

- Sedentary: 1.2
- Lightly active: 1.375
- Moderately active: 1.55
- Very active: 1.725
- Extra active: 1.9

**Implementation in Dashboard.jsx and DietCalculator.jsx**:

```javascript
const tdee = user?.weight && user?.age && user?.gender ? (() => {
  const bmrBase = user.gender === 'female'
    ? 447.593 + (9.247 * user.weight) + (3.098 * (user.height || 170)) - (4.330 * user.age)
    : 88.362 + (13.397 * user.weight) + (4.799 * (user.height || 175)) - (5.677 * user.age);
  const multipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, very_active: 1.725, extra_active: 1.9 };
  return Math.round(bmrBase * (multipliers[user.activity_level] || 1.55));
})() : null;
```

### 5.4.3 Macronutrient Distribution Algorithm

Based on the calculated TDEE and fitness goals, macronutrients are distributed as follows:

1. Protein: 1.8g per kg body weight (general), 2.2g per kg (muscle gain)
2. Fat: 25% of total calories
3. Carbohydrates: Remaining calories after protein and fat

Calorie conversions:
- 1g protein = 4 calories
- 1g carbohydrate = 4 calories
- 1g fat = 9 calories

**Implementation in DietCalculator.jsx**:

```javascript
const calculate = () => {
  const { weight, height, age, gender, activity, goal } = form;
  if (!weight || !height || !age) return toast.error('Fill all required fields');
  const w = parseFloat(weight), h = parseFloat(height), a = parseFloat(age);
  const bmr = gender === 'female'
    ? 447.593 + 9.247*w + 3.098*h - 4.330*a
    : 88.362 + 13.397*w + 4.799*h - 5.677*a;
  let tdee = bmr * (ACTIVITY_MULTIPLIERS[activity] || 1.55);

  const goalCals = goal === 'weight_loss' ? tdee - 500 : goal === 'muscle_gain' ? tdee + 300 : tdee;
  const protein = Math.round(w * (goal === 'muscle_gain' ? 2.2 : 1.8));
  const fat = Math.round(goalCals * 0.25 / 9);
  const carbs = Math.round((goalCals - protein*4 - fat*9) / 4);
  setResult({ tdee: Math.round(tdee), target: Math.round(goalCals), protein, fat, carbs, bmr: Math.round(bmr) });
};
```

### 5.4.4 Workout Planning Algorithm

The workout planner uses predefined templates and allows custom plan creation. The algorithm considers:

- Muscle group targeting for balanced development
- Progressive overload principles
- Rest periods based on exercise intensity
- Exercise sequencing for optimal performance

**Key features**:
- Template-based plans (Push, Pull, Legs, Core/Cardio)
- Custom exercise addition and modification
- Intensity levels (Light, Moderate, High)
- Duration estimation based on exercises

### 5.4.5 Authentication and Security Algorithms

- **Password Hashing**: Uses bcrypt with 12 salt rounds for secure password storage
- **JWT Token Generation**: Creates tokens with 7-day expiration for session management
- **Token Verification**: Middleware validates JWT tokens on protected routes

## 5.5 Database Design and Models

### 5.5.1 User Model

```javascript
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], default: 'other' },
  age: { type: Number },
  weight: { type: Number },
  height: { type: Number },
  fitness_goal: { type: String, enum: ['weight_loss', 'muscle_gain', 'endurance', 'flexibility', 'general'], default: 'general' },
  activity_level: { type: String, enum: ['sedentary', 'light', 'moderate', 'very_active', 'extra_active'], default: 'moderate' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

### 5.5.2 Blog Post Model

```javascript
const blogPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, enum: ['workout', 'nutrition', 'motivation', 'tips', 'general'], default: 'general' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

### 5.5.3 Additional Models

- BMI Records
- Nutrition Logs
- Workout Plans
- Exercise Logs

## 5.6 API Endpoints

### 5.6.1 Authentication Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)

### 5.6.2 User Data Endpoints

- `GET /api/user/bmi` - Get BMI history
- `POST /api/user/bmi` - Save BMI record
- `GET /api/user/diet` - Get nutrition logs
- `POST /api/user/diet` - Save nutrition log
- `GET /api/user/workouts` - Get workout plans
- `POST /api/user/workouts` - Save workout plan

### 5.6.3 Blog Endpoints

- `GET /api/blog/posts` - Get blog posts with pagination
- `POST /api/blog/posts` - Create new post
- `PUT /api/blog/posts/:id` - Update post
- `DELETE /api/blog/posts/:id` - Delete post
- `POST /api/blog/posts/:id/like` - Like/unlike post

## 5.7 Security Implementation

### 5.7.1 Password Security

- Passwords are hashed using bcrypt with 12 salt rounds
- Minimum password length of 6 characters
- Secure password comparison using bcrypt.compare()

### 5.7.2 Authentication Security

- JWT tokens with 7-day expiration
- Token verification on protected routes
- User ID and email stored in token payload

### 5.7.3 Data Validation

- Input validation on both client and server sides
- MongoDB schema validation
- Sanitization of user inputs

### 5.7.4 CORS Configuration

- Configured to allow requests from the frontend domain
- Proper headers for cross-origin requests

## 5.8 Performance Optimizations

### 5.8.1 Frontend Optimizations

- React.lazy() for code splitting
- Memoization of expensive calculations
- Efficient re-rendering with useMemo and useCallback
- Optimized bundle size with Vite

### 5.8.2 Backend Optimizations

- Database indexing on frequently queried fields
- Pagination for large data sets
- Efficient MongoDB queries with proper projections
- Compression middleware for responses

### 5.8.3 Caching Strategies

- Client-side caching of user data
- API response caching where appropriate
- Static asset caching with proper headers

## 5.9 Testing and Validation

### 5.9.1 Frontend Testing

- Component testing with React Testing Library
- User interaction testing
- Form validation testing

### 5.9.2 Backend Testing

- API endpoint testing
- Authentication testing
- Database operation testing

### 5.9.3 Integration Testing

- End-to-end user flows
- API integration testing
- Cross-browser compatibility testing

## 5.10 Deployment and Maintenance

### 5.10.1 Development Environment

- Local development with hot reloading
- Environment-specific configurations
- Development and production builds

### 5.10.2 Production Deployment

- Optimized production builds
- Environment variable management
- Database connection pooling
- Error logging and monitoring

### 5.10.3 Maintenance Procedures

- Regular dependency updates
- Database backups
- Performance monitoring
- Security updates and patches

This implementation provides a comprehensive fitness tracking platform with modern web technologies, robust algorithms, and secure authentication. The modular architecture allows for easy maintenance and future enhancements.

### 5.3.4 BMI Calculator Module

Calculates Body Mass Index and provides health recommendations with visual gauge and history tracking.

**BMICalculator Component (client/src/components/BMI/BMICalculator.jsx)**:

```jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Activity, TrendingUp, Info, Scale } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import toast from 'react-hot-toast';
import './BMI.css';

const BMI_RANGES = [
  { label: 'Underweight', range: '< 18.5',  color: '#00e5ff', from: 0,    to: 18.5 },
  { label: 'Normal',      range: '18.5–24.9',color: '#2ed573', from: 18.5, to: 24.9 },
  { label: 'Overweight',  range: '25–29.9',  color: '#ffa502', from: 25,   to: 29.9 },
  { label: 'Obese',       range: '≥ 30',     color: '#ff4757', from: 30,   to: 40 },
];

const ADVICE = {
  Underweight: { icon: '🍽️', msg: 'Focus on a calorie-surplus diet rich in proteins and healthy fats. Consider strength training to build lean muscle mass.', tips: ['Eat 5-6 small meals daily', 'Add nuts, avocado & whole grains', 'Start resistance training', 'Track your calorie intake'] },
  Normal:      { icon: '✅', msg: 'Great job! Maintain your healthy weight with balanced nutrition and regular exercise. Focus on strength and endurance.', tips: ['Maintain balanced macros', 'Mix cardio & strength training', 'Stay hydrated (2-3L/day)', 'Get 7-9 hours of sleep'] },
  Overweight:  { icon: '🏃', msg: 'A combination of moderate calorie deficit and increased physical activity can help. Focus on sustainable changes.', tips: ['Create a 300-500 kcal deficit', 'Add 30 min cardio daily', 'Reduce processed foods', 'Increase protein intake'] },
  Obese:       { icon: '⚕️', msg: 'Consider consulting a healthcare professional. Start with low-impact exercise and focus on building sustainable habits.', tips: ['Consult a doctor first', 'Start with walking & swimming', 'Track all food intake', 'Reduce sugar & refined carbs'] },
};

function getBMIColor(bmi) {
  if (bmi < 18.5) return '#00e5ff';
  if (bmi < 25)   return '#2ed573';
  if (bmi < 30)   return '#ffa502';
  return '#ff4757';
}

function getNeedleRotation(bmi) {
  const clamped = Math.min(Math.max(bmi, 10), 40);
  return ((clamped - 10) / 30) * 180 - 90;
}

export default function BMICalculator() {
  const { user, api } = useAuth();
  const [weight, setWeight] = useState(user?.weight || '');
  const [height, setHeight] = useState(user?.height || '');
  const [unit, setUnit] = useState('metric');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/user/bmi').then(r => setHistory(r.data.records)).catch(() => {});
  }, [api]);

  const calcBMI = () => {
    let w = parseFloat(weight), h = parseFloat(height);
    if (!w || !h || w <= 0 || h <= 0) return toast.error('Enter valid weight and height');
    if (unit === 'imperial') { w = w * 0.453592; h = h * 2.54; }
    const bmi = w / ((h / 100) ** 2);
    const cat = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';
    setResult({ bmi: bmi.toFixed(1), category: cat, weight: w, height: h });
  };

  const saveRecord = async () => {
    if (!result) return;
    setLoading(true);
    try {
      const r = await api.post('/user/bmi', { weight: result.weight, height: result.height });
      setHistory(h => [r.data.record, ...h].slice(0, 10));
      toast.success('BMI record saved! 📊');
    } catch { toast.error('Failed to save'); }
    finally { setLoading(false); }
  };

  const histChartData = [...history].reverse().map((r, i) => ({ date: `#${i+1}`, bmi: r.bmi }));

  return (
    <div className="bmi-page animate-fade-in">
      <div className="bmi-layout">
        <div className="bmi-calculator card">
          <div className="calc-header">
            <Scale size={20} color="var(--accent2)" />
            <h2>BMI Calculator</h2>
          </div>

          <div className="unit-toggle">
            <button className={`unit-btn ${unit === 'metric' ? 'active' : ''}`} onClick={() => setUnit('metric')}>Metric (kg/cm)</button>
            <button className={`unit-btn ${unit === 'imperial' ? 'active' : ''}`} onClick={() => setUnit('imperial')}>Imperial (lb/in)</button>
          </div>

          <div className="form-group">
            <label className="form-label">Weight ({unit === 'metric' ? 'kg' : 'lbs'})</label>
            <input className="form-input" type="number" placeholder={unit === 'metric' ? '70' : '154'}
              value={weight} onChange={e => setWeight(e.target.value)} step="0.1" min="1" />
          </div>

          <div className="form-group" style={{ marginTop: 14 }}>
            <label className="form-label">Height ({unit === 'metric' ? 'cm' : 'inches'})</label>
            <input className="form-input" type="number" placeholder={unit === 'metric' ? '175' : '69'}
              value={height} onChange={e => setHeight(e.target.value)} min="1" />
          </div>

          <button className="btn btn-primary btn-full btn-lg" style={{ marginTop: 20 }} onClick={calcBMI}>
            Calculate BMI
          </button>

          <div className="bmi-ranges">
            <p className="range-title">BMI Categories</p>
            {BMI_RANGES.map(r => (
              <div key={r.label} className={`range-item ${result?.category === r.label ? 'active' : ''}`}>
                <span className="range-dot" style={{ background: r.color }} />
                <span className="range-label">{r.label}</span>
                <span className="range-val" style={{ color: r.color }}>{r.range}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bmi-results">
          {result ? (
            <>
              <div className="card bmi-gauge-card">
                <div className="gauge-wrap">
                  <svg viewBox="0 0 200 110" className="gauge-svg">
                    <path d="M 10 100 A 90 90 0 0 1 47.5 26.7" stroke="#00e5ff" strokeWidth="10" fill="none" strokeLinecap="round" opacity={0.3} />
                    <path d="M 47.5 26.7 A 90 90 0 0 1 100 10" stroke="#2ed573" strokeWidth="10" fill="none" strokeLinecap="round" opacity={0.3} />
                    <path d="M 100 10 A 90 90 0 0 1 152.5 26.7" stroke="#ffa502" strokeWidth="10" fill="none" strokeLinecap="round" opacity={0.3} />
                    <path d="M 152.5 26.7 A 90 90 0 0 1 190 100" stroke="#ff4757" strokeWidth="10" fill="none" strokeLinecap="round" opacity={0.3} />
                    <path
                      d={result.bmi < 18.5 ? "M 10 100 A 90 90 0 0 1 47.5 26.7"
                        : result.bmi < 25 ? "M 47.5 26.7 A 90 90 0 0 1 100 10"
                        : result.bmi < 30 ? "M 100 10 A 90 90 0 0 1 152.5 26.7"
                        : "M 152.5 26.7 A 90 90 0 0 1 190 100"}
                      stroke={getBMIColor(result.bmi)} strokeWidth="10" fill="none" strokeLinecap="round"
                    />
                    <g transform={`rotate(${getNeedleRotation(parseFloat(result.bmi))}, 100, 100)`}>
                      <line x1="100" y1="100" x2="100" y2="18" stroke={getBMIColor(result.bmi)} strokeWidth="2.5" strokeLinecap="round" />
                      <circle cx="100" cy="100" r="5" fill={getBMIColor(result.bmi)} />
                    </g>
                    <text x="100" y="82" textAnchor="middle" fill={getBMIColor(result.bmi)} fontSize="22" fontFamily="Bebas Neue" letterSpacing="1">{result.bmi}</text>
                    <text x="100" y="96" textAnchor="middle" fill="var(--text-muted)" fontSize="9" fontFamily="Barlow Condensed" fontWeight="600" letterSpacing="2">BMI INDEX</text>
                  </svg>
                </div>
                <div className="gauge-category" style={{ color: getBMIColor(result.bmi) }}>
                  {result.category}
                </div>
                <button className="btn btn-secondary" style={{ marginTop: 12, width: '100%' }} onClick={saveRecord} disabled={loading}>
                  {loading ? <span className="spinner" /> : '💾 Save This Record'}
                </button>
              </div>

              <div className="card bmi-advice-card">
                <div className="advice-icon">{ADVICE[result.category].icon}</div>
                <h3 className="advice-title">Recommendations for {result.category}</h3>
                <p className="advice-msg">{ADVICE[result.category].msg}</p>
                <div className="advice-tips">
                  {ADVICE[result.category].tips.map(t => (
                    <div key={t} className="advice-tip">
                      <span className="tip-dot" style={{ background: getBMIColor(result.bmi) }} />
                      {t}
                    </div>
                  ))}
                </div>
              </div>

              <div className="card" style={{ padding: 20 }}>
                <div style={{ display:'flex', alignItems:'center', gap: 8, marginBottom: 12 }}>
                  <Info size={16} color="var(--accent)" />
                  <h4 style={{ fontFamily: 'var(--font-condensed)', fontSize: '0.95rem', fontWeight: 700 }}>Healthy Weight Range for {result.height.toFixed(0)} cm</h4>
                </div>
                <div style={{ display:'flex', gap: 20 }}>
                  <div><span style={{ fontSize:'0.75rem', color:'var(--text-muted)', display:'block', fontFamily:'var(--font-condensed)', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase' }}>Min (18.5)</span>
                    <span style={{ fontFamily:'var(--font-display)', fontSize:'1.6rem', color:'#2ed573' }}>{(18.5 * (result.height/100)**2).toFixed(1)} kg</span></div>
                  <div><span style={{ fontSize:'0.75rem', color:'var(--text-muted)', display:'block', fontFamily:'var(--font-condensed)', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase' }}>Max (24.9)</span>
                    <span style={{ fontFamily:'var(--font-display)', fontSize:'1.6rem', color:'#2ed573' }}>{(24.9 * (result.height/100)**2).toFixed(1)} kg</span></div>
                </div>
              </div>
            </>
          ) : (
            <div className="card bmi-placeholder">
              <div className="empty-state">
                <Activity size={56} />
                <h3>Enter Your Measurements</h3>
                <p>Fill in your weight and height to calculate your BMI score and get personalized health recommendations.</p>
              </div>
            </div>
          )}

          {history.length >= 2 && (
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.2rem', marginBottom: 12 }}>BMI History</h3>
              <ResponsiveContainer width="100%" height={140}>
                <AreaChart data={histChartData}>
                  <defs>
                    <linearGradient id="bmiG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent2)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--accent2)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fill:'var(--text-muted)', fontSize:10 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[15, 35]} tick={{ fill:'var(--text-muted)', fontSize:10 }} axisLine={false} tickLine={false} />
                  <ReferenceLine y={18.5} stroke="#00e5ff" strokeDasharray="3 3" />
                  <ReferenceLine y={24.9} stroke="#2ed573" strokeDasharray="3 3" />
                  <ReferenceLine y={29.9} stroke="#ffa502" strokeDasharray="3 3" />
                  <Tooltip contentStyle={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:8 }} />
                  <Area type="monotone" dataKey="bmi" stroke="var(--accent2)" fill="url(#bmiG)" strokeWidth={2} dot={{ fill:'var(--accent2)', r:4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

### 5.3.5 Diet Calculator and Macros Module

Calculates Total Daily Energy Expenditure (TDEE), macronutrient distribution, and provides meal planning features.

**DietCalculator Component (client/src/components/Diet/DietCalculator.jsx)**:

```jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Flame, Droplets, Apple, Target, Plus, Check } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';
import toast from 'react-hot-toast';
import './Diet.css';

const ACTIVITY_MULTIPLIERS = { sedentary:1.2, light:1.375, moderate:1.55, very_active:1.725, extra_active:1.9 };
const MEAL_IDEAS = {
  breakfast: ['Oatmeal + berries + nuts','Greek yogurt + granola','Eggs + avocado toast','Smoothie bowl','Whole grain pancakes'],
  lunch:     ['Grilled chicken salad','Quinoa + roasted veggies','Turkey wrap + fruit','Brown rice + salmon','Lentil soup + bread'],
  dinner:    ['Salmon + sweet potato','Chicken stir-fry + rice','Bean tacos + guacamole','Pasta + lean meat sauce','Tofu + broccoli + quinoa'],
  snacks:    ['Apple + almond butter','Protein shake','Mixed nuts','Hummus + veggies','Cottage cheese'],
};

const PIE_COLORS = ['#c8f135','#00e5ff','#ff9f43'];

export default function DietCalculator() {
  const { user, api } = useAuth();
  const [tab, setTab] = useState('calculator');
  const [form, setForm] = useState({
    weight: user?.weight || '', height: user?.height || '',
    age: user?.age || '', gender: user?.gender || 'male',
    activity: user?.activity_level || 'moderate', goal: user?.fitness_goal || 'general',
  });
  const [result, setResult] = useState(null);
  const [log, setLog] = useState({ calories: '', protein: '', carbs: '', fat: '', water: '' });
  const [saving, setSaving] = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const calculate = () => {
    const { weight, height, age, gender, activity, goal } = form;
    if (!weight || !height || !age) return toast.error('Fill all required fields');
    const w = parseFloat(weight), h = parseFloat(height), a = parseFloat(age);
    const bmr = gender === 'female'
      ? 447.593 + 9.247*w + 3.098*h - 4.330*a
      : 88.362 + 13.397*w + 4.799*h - 5.677*a;
    let tdee = bmr * (ACTIVITY_MULTIPLIERS[activity] || 1.55);

    const goalCals = goal === 'weight_loss' ? tdee - 500 : goal === 'muscle_gain' ? tdee + 300 : tdee;
    const protein = Math.round(w * (goal === 'muscle_gain' ? 2.2 : 1.8));
    const fat = Math.round(goalCals * 0.25 / 9);
    const carbs = Math.round((goalCals - protein*4 - fat*9) / 4);
    setResult({ tdee: Math.round(tdee), target: Math.round(goalCals), protein, fat, carbs, bmr: Math.round(bmr) });
    setLog(l => ({ ...l, calories: Math.round(goalCals).toString() }));
  };

  const saveLog = async () => {
    if (!log.calories) return toast.error('Enter at least calories');
    setSaving(true);
    const today = new Date().toISOString().split('T')[0];
    try {
      await api.post('/user/diet', {
        date: today,
        calories_target: parseInt(log.calories),
        calories_consumed: parseInt(log.calories),
        protein_g: parseFloat(log.protein) || 0,
        carbs_g: parseFloat(log.carbs) || 0,
        fat_g: parseFloat(log.fat) || 0,
        water_ml: parseFloat(log.water) * 1000 || 0,
      });
      toast.success("Today's nutrition logged! 🥗");
    } catch { toast.error('Failed to save log'); }
    finally { setSaving(false); }
  };

  const macroData = result ? [
    { name: 'Protein', value: result.protein * 4, grams: result.protein },
    { name: 'Carbs',   value: result.carbs * 4,   grams: result.carbs },
    { name: 'Fat',     value: result.fat * 9,     grams: result.fat },
  ] : [];

  const consumed = result ? Math.round((parseInt(log.protein||0)*4 + parseInt(log.carbs||0)*4 + parseInt(log.fat||0)*9)) : 0;

  return (
    <div className="diet-page animate-fade-in">
      <div className="diet-tabs">
        {[['calculator','🧮 TDEE Calculator'],['log','📝 Daily Log'],['meals','🍽️ Meal Ideas']].map(([k,l]) => (
          <button key={k} className={`diet-tab ${tab===k?'active':''}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {tab === 'calculator' && (
        <div className="diet-layout">
          <div className="card diet-input-card">
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.4rem', marginBottom: 20 }}>
              <Flame size={20} color="var(--warning)" style={{ verticalAlign:'middle', marginRight: 8 }} />
              TDEE Calculator
            </h2>
            <div className="grid-2" style={{ gap: 12 }}>
              {[
                { name:'weight', label:'Weight (kg)', ph:'70', type:'number' },
                { name:'height', label:'Height (cm)', ph:'175', type:'number' },
                { name:'age',    label:'Age',         ph:'25',  type:'number' },
              ].map(f => (
                <div key={f.name} className="form-group">
                  <label className="form-label">{f.label}</label>
                  <input className="form-input" type={f.type} name={f.name} placeholder={f.ph} value={form[f.name]} onChange={handle} />
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select className="form-select" name="gender" value={form.gender} onChange={handle}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
            <div className="form-group" style={{ marginTop: 12 }}>
              <label className="form-label">Activity Level</label>
              <select className="form-select" name="activity" value={form.activity} onChange={handle}>
                <option value="sedentary">Sedentary (little or no exercise)</option>
                <option value="light">Lightly active (1-3x/wk)</option>
                <option value="moderate">Moderately active (3-5x/wk)</option>
                <option value="very_active">Very active (6-7x/wk)</option>
                <option value="extra_active">Extra active (athlete/physical job)</option>
              </select>
            </div>
            <div className="form-group" style={{ marginTop: 12 }}>
              <label className="form-label">Fitness Goal</label>
              <div className="goal-grid" style={{ display:'flex', flexWrap:'wrap', gap: 8 }}>
                {[['weight_loss','🔥 Lose Weight'],['general','⚖️ Maintain'],['muscle_gain','💪 Gain Muscle']].map(([v,l]) => (
                  <button key={v} type="button"
                    className={`goal-chip ${form.goal===v?'active':''}`}
                    onClick={() => setForm(f => ({...f, goal: v}))}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <button className="btn btn-primary btn-full btn-lg" style={{ marginTop: 20 }} onClick={calculate}>
              <Flame size={18} /> Calculate My Macros
            </button>
          </div>

          <div className="diet-results">
            {result ? (
              <>
                <div className="grid-2" style={{ gap: 14 }}>
                  {[
                    { label:'Daily Calories', value: result.target, unit:'kcal', color:'var(--warning)' },
                    { label:'Base Metabolic Rate', value: result.bmr, unit:'kcal', color:'var(--accent2)' },
                    { label:'Maintenance (TDEE)', value: result.tdee, unit:'kcal', color:'var(--success)' },
                    { label:'Weekly Balance', value: result.target > result.tdee ? `+${(result.target-result.tdee)*7}` : `${(result.target-result.tdee)*7}`, unit:'kcal', color: result.target > result.tdee ? 'var(--success)' : 'var(--danger)' },
                  ].map(s => (
                    <div key={s.label} className="stat-card" style={{ padding: 16 }}>
                      <div className="stat-label">{s.label}</div>
                      <div className="stat-value" style={{ fontSize:'1.8rem', color: s.color }}>{s.value}</div>
                      <div className="stat-unit">{s.unit}</div>
                    </div>
                  ))}
                </div>

                <div className="card macro-card">
                  <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.2rem', marginBottom: 16 }}>Macro Breakdown</h3>
                  <div className="macro-layout">
                    <ResponsiveContainer width={180} height={180}>
                      <PieChart>
                        <Pie data={macroData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
                          {macroData.map((e, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                        </Pie>
                        <Tooltip formatter={(v,n,p) => [`${p.payload.grams}g`, n]} contentStyle={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius: 8, fontFamily:'var(--font-condensed)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="macro-list">
                      {[
                        { name:'Protein', g: result.protein, cal: result.protein*4, color:'#c8f135', note:'Muscle building' },
                        { name:'Carbs',   g: result.carbs,   cal: result.carbs*4,   color:'#00e5ff', note:'Primary energy' },
                        { name:'Fat',     g: result.fat,     cal: result.fat*9,     color:'#ff9f43', note:'Hormones & brain' },
                      ].map(m => (
                        <div key={m.name} className="macro-item">
                          <span className="macro-dot" style={{ background: m.color }} />
                          <div>
                            <span className="macro-name" style={{ color: m.color }}>{m.name}</span>
                            <span className="macro-note">{m.note}</span>
                          </div>
                          <div className="macro-grams">
                            <span className="macro-g">{m.g}g</span>
                            <span className="macro-cal">{m.cal} kcal</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="card" style={{ padding: 20 }}>
                  <div style={{ display:'flex', alignItems:'center', gap: 8, marginBottom: 12 }}>
                    <Droplets size={18} color="var(--accent2)" />
                    <h3 style={{ fontFamily:'var(--font-condensed)', fontSize:'1rem', fontWeight: 700 }}>Daily Water Intake</h3>
                  </div>
                  <div style={{ display:'flex', alignItems:'baseline', gap: 8 }}>
                    <span style={{ fontFamily:'var(--font-display)', fontSize:'2.5rem', color:'var(--accent2)' }}>
                      {(parseFloat(form.weight || 70) * 0.033).toFixed(1)}
                    </span>
                    <span style={{ fontSize:'0.9rem', color:'var(--text-muted)' }}>litres per day recommended</span>
                  </div>
                  <p style={{ fontSize:'0.82rem', color:'var(--text-muted)', marginTop: 6 }}>
                    Based on 33ml per kg of body weight. Increase by 500ml per hour of exercise.
                  </p>
                </div>
              </>
            ) : (
              <div className="card" style={{ padding: 40 }}>
                <div className="empty-state">
                  <Target size={52} />
                  <h3>Calculate Your Macros</h3>
                  <p>Enter your details on the left to get your personalized daily calorie and macro targets.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'log' && (
        <div className="diet-log-section">
          <div className="card" style={{ padding: 28, maxWidth: 600, margin: '0 auto' }}>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.5rem', marginBottom: 6 }}>Today's Nutrition Log</h2>
            <p style={{ fontSize:'0.85rem', color:'var(--text-muted)', marginBottom: 24 }}>{new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</p>
            <div className="log-grid">
              {[
                { key:'calories', label:'Calories (kcal)', ph:'2000', icon:'🔥' },
                { key:'protein',  label:'Protein (g)',     ph:'150',  icon:'💪' },
                { key:'carbs',    label:'Carbohydrates (g)',ph:'250', icon:'🌾' },
                { key:'fat',      label:'Fat (g)',          ph:'65',  icon:'🥑' },
                { key:'water',    label:'Water (litres)',   ph:'2.5', icon:'💧' },
              ].map(f => (
                <div key={f.key} className="form-group">
                  <label className="form-label">{f.icon} {f.label}</label>
                  <input className="form-input" type="number" placeholder={f.ph} step="0.1"
                    value={log[f.key]} onChange={e => setLog(l => ({...l, [f.key]: e.target.value}))} />
                </div>
              ))}
            </div>
            {consumed > 0 && (
              <div className="log-summary">
                <span>Calories from logged macros:</span>
                <span style={{ fontFamily:'var(--font-mono)', color:'var(--accent)' }}>{consumed} kcal</span>
              </div>
            )}
            <button className="btn btn-primary btn-full btn-lg" style={{ marginTop: 20 }} onClick={saveLog} disabled={saving}>
              {saving ? <span className="spinner" /> : <><Check size={18} /> Save Today's Log</>}
            </button>
          </div>
        </div>
      )}

      {tab === 'meals' && (
        <div className="meal-ideas-section">
          <div className="meal-categories">
            {Object.keys(MEAL_IDEAS).map(cat => (
              <div key={cat} className="meal-category">
                <h3 className="meal-cat-title">{cat.charAt(0).toUpperCase() + cat.slice(1)}</h3>
                <div className="meal-list">
                  {MEAL_IDEAS[cat].map(meal => (
                    <div key={meal} className="meal-item">
                      <Apple size={16} color="var(--accent)" />
                      <span>{meal}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

### 5.3.6 YouTube Integration Module

Provides embedded YouTube exercise tutorial videos with filtering and search capabilities.

**ExerciseVideos Component (client/src/components/Workout/ExerciseVideos.jsx)**:

```jsx
import { useState } from 'react';
import { PlaySquare, Search, Filter } from 'lucide-react';
import './Videos.css';

const VIDEOS = [
  { id:'wVauS4Rkjbs', title:'Perfect Bench Press Form', muscle:'Chest',    level:'Intermediate', duration:'8:24' },
  { id:'IODxDxX7oi4', title:'Push-Up Mastery Guide',   muscle:'Chest',    level:'Beginner',     duration:'6:15' },
  { id:'op9KvZxD6FA', title:'Deadlift Technique 101',  muscle:'Back',     level:'Intermediate', duration:'12:30' },
  { id:'eGo4IYlbE5g', title:'Pull-Up Perfect Form',    muscle:'Back',     level:'Beginner',     duration:'7:42' },
  { id:'2yjwXTZQDDY', title:'Overhead Press Guide',    muscle:'Shoulders',level:'Intermediate', duration:'9:10' },
  { id:'3VczyRUPH84', title:'Lateral Raise Technique', muscle:'Shoulders',level:'Beginner',     duration:'5:30' },
  { id:'xQvzIHmqSAE', title:'Squat Like a Pro',        muscle:'Legs',     level:'Intermediate', duration:'11:20' },
  { id:'H0k-LchDAxE', title:'Lunge Variations Guide',  muscle:'Legs',     level:'Beginner',     duration:'6:50' },
  { id:'k3V0X_olKLM', title:'Core Workout Masterclass',muscle:'Core',     level:'Intermediate', duration:'14:00' },
  { id:'169gWAoYT5w', title:'Plank Progression Plan',  muscle:'Core',     level:'Beginner',     duration:'5:00' },
  { id:'ml6cT4AZdqI', title:'HIIT Cardio Full Routine', muscle:'Cardio',   level:'Advanced',     duration:'20:15' },
  { id:'H3nuMc6P6Cw', title:'Beginner Cardio Workout',  muscle:'Cardio',   level:'Beginner',     duration:'15:00' },
  { id:'ykJmrZ5v0Oo', title:'Bicep Curl Perfection',    muscle:'Arms',     level:'Beginner',     duration:'5:45' },
  { id:'8Ey4-oDMg6Q', title:'Tricep Dip Masterclass',   muscle:'Arms',     level:'Intermediate', duration:'6:20' },
  { id:'qFpSXoEQhbM', title:'Full Body Stretching Flow',muscle:'Flexibility',level:'Beginner', duration:'18:00' },
  { id:'g_tea8ZNk5A', title:'Yoga for Athletes',        muscle:'Flexibility',level:'Intermediate',duration:'22:30' },
];

const MUSCLES = ['All', ...Array.from(new Set(VIDEOS.map(v => v.muscle)))];
const LEVELS  = ['All', 'Beginner', 'Intermediate', 'Advanced'];

const LEVEL_COLORS = { Beginner:'#2ed573', Intermediate:'#ffa502', Advanced:'#ff4757' };

export default function ExerciseVideos() {
  const [activeVideo, setActiveVideo] = useState(null);
  const [search, setSearch] = useState('');
  const [muscle, setMuscle] = useState('All');
  const [level,  setLevel]  = useState('All');

  const filtered = VIDEOS.filter(v => {
    const matchSearch = !search || v.title.toLowerCase().includes(search.toLowerCase());
    const matchMuscle = muscle === 'All' || v.muscle === muscle;
    const matchLevel  = level  === 'All' || v.level  === level;
    return matchSearch && matchMuscle && matchLevel;
  });

  return (
    <div className="videos-page animate-fade-in">
      <div className="videos-toolbar">
        <div className="video-search">
          <Search size={16} className="vs-icon" />
          <input
            className="form-input"
            style={{ paddingLeft: 40 }}
            placeholder="Search exercises..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <Filter size={14} />
          {MUSCLES.map(m => (
            <button key={m} className={`tag ${muscle===m?'active':''}`} onClick={() => setMuscle(m)}>{m}</button>
          ))}
        </div>
        <div className="filter-group">
          {LEVELS.map(l => (
            <button key={l} className={`tag ${level===l?'active':''}`} onClick={() => setLevel(l)}
              style={level===l ? { background: LEVEL_COLORS[l]+'22', borderColor: LEVEL_COLORS[l], color: LEVEL_COLORS[l] } : {}}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {activeVideo && (
        <div className="video-player-section animate-fade-up">
          <div className="video-player-card card">
            <div className="yt-embed-wrap">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=1&rel=0`}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </iframe>
            </div>
            <div className="player-info">
              <h2 className="player-title">{activeVideo.title}</h2>
              <div className="player-meta">
                <span className="badge badge-accent">{activeVideo.muscle}</span>
                <span className="badge" style={{ background: LEVEL_COLORS[activeVideo.level]+'22', color: LEVEL_COLORS[activeVideo.level] }}>
                  {activeVideo.level}
                </span>
                <span style={{ color:'var(--text-muted)', fontSize:'0.85rem', fontFamily:'var(--font-mono)' }}>
                  ⏱ {activeVideo.duration}
                </span>
              </div>
              <p style={{ fontSize:'0.9rem', color:'var(--text-secondary)', marginTop: 8, lineHeight: 1.6 }}>
                Master perfect form and technique for <strong style={{color:'var(--text-primary)'}}>{activeVideo.title}</strong>. 
                This video covers proper posture, common mistakes, and progression tips to maximize results and prevent injury.
              </p>
              <button className="btn btn-secondary btn-sm" style={{ marginTop: 12 }} onClick={() => setActiveVideo(null)}>
                ✕ Close Player
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: activeVideo ? 24 : 0 }}>
        <div className="section-header\">
          <div>
            <h2 className="section-title">Exercise Library</h2>
            <p className="section-subtitle">{filtered.length} videos — click to watch with expert form guidance</p>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state" style={{ padding: '60px 20px' }}>
            <PlaySquare size={56} />
            <h3>No videos found</h3>
            <p>Try changing your search or filter criteria</p>
          </div>
        ) : (
          <div className="videos-grid">
            {filtered.map(video => (
              <div
                key={video.id}
                className={`video-card card ${activeVideo?.id === video.id ? 'active' : ''}`}
                onClick={() => setActiveVideo(video)}
              >
                <div className="video-thumb">
                  <img
                    src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                    alt={video.title}
                    loading="lazy"
                  />
                  <div className="video-play-overlay">
                    <div className="play-btn-circle">
                      <PlaySquare size={28} />
                    </div>
                  </div>
                  <div className="video-duration">{video.duration}</div>
                </div>
                <div className="video-info">
                  <h3 className="video-title">{video.title}</h3>
                  <div className="video-tags">
                    <span className="badge badge-accent" style={{ fontSize:'0.7rem' }}>{video.muscle}</span>
                    <span className="badge" style={{
                      fontSize:'0.7rem',
                      background: LEVEL_COLORS[video.level]+'22',
                      color: LEVEL_COLORS[video.level]
                    }}>
                      {video.level}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

### 5.3.7 AI Chatbot Integration Module

Provides personalized AI-powered fitness coaching using OpenRouter API with GPT-3.5-turbo.

**Chatbot Component (client/src/components/Chatbot/Chatbot.jsx)**:

```jsx
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Send, Bot, User, Trash2, Zap, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import './Chatbot.css';

const SYSTEM_PROMPT = (user) => `You are FitBot, an elite personal fitness coach and nutritionist AI embedded in the FitQuest fitness app. 

USER PROFILE:
- Name: ${user?.name || 'Athlete'}
- Gender: ${user?.gender || 'not specified'}
- Age: ${user?.age || 'not specified'}
- Weight: ${user?.weight ? user.weight + ' kg' : 'not specified'}
- Height: ${user?.height ? user.height + ' cm' : 'not specified'}
- Fitness Goal: ${user?.fitness_goal?.replace('_',' ') || 'general fitness'}
- Activity Level: ${user?.activity_level?.replace('_',' ') || 'moderate'}

YOUR ROLE:
You provide personalized, science-based fitness and nutrition advice. Be energetic, motivating, and specific. Always consider the user's profile when giving advice. Use metrics/numbers wherever possible.

GUIDELINES:
- Give concrete, actionable workout plans with sets, reps, rest times
- Provide specific calorie and macro recommendations based on their stats
- Suggest exercises appropriate for their fitness level and goal
- Use encouraging language — celebrate their commitment
- Format workout plans clearly with bullet points or numbered lists
- When asked for a full workout plan, structure it by day (Mon-Sun)
- Include warm-up and cool-down recommendations
- Mention injury prevention and proper form tips
- Keep responses focused and practical

PERSONALITY: Enthusiastic, knowledgeable, supportive. Like a world-class personal trainer who genuinely cares about the user's success.`;

const QUICK_PROMPTS = [
  { label: '💪 Full Week Plan',   text: 'Create a complete 7-day workout plan for me based on my profile and fitness goal.' },
  { label: '🔥 Burn Fat Fast',    text: 'Design a fat-burning workout routine I can do this week with my current stats.' },
  { label: '🥗 My Daily Macros',  text: 'Calculate my ideal daily calories, protein, carbs, and fat based on my profile.' },
  { label: '🏋️ Build Muscle',     text: 'Give me a hypertrophy-focused training split and nutrition plan to build muscle.' },
  { label: '🧘 Recovery Day',     text: 'Suggest active recovery activities and stretches I can do on rest days.' },
  { label: '⚡ Quick 20-Min HIIT', text: 'Give me an intense 20-minute HIIT workout I can do anywhere with no equipment.' },
];

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`message-row ${isUser ? 'user' : 'bot'}`}>
      <div className="msg-avatar">
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>
      <div className="msg-bubble">
        <div className="msg-content" dangerouslySetInnerHTML={{
          __html: msg.content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/^### (.*$)/gm, '<h4>$1</h4>')
            .replace(/^## (.*$)/gm, '<h3>$1</h3>')
            .replace(/^# (.*$)/gm, '<h2>$1</h2>')
            .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
            .replace(/^- (.*$)/gm, '<li>$1</li>')
            .replace(/(<li>.*<\/li>\n?)+/g, s => `<ul>${s}</ul>`)
            .replace(/\n/g, '<br/>')
        }} />
        <div className="msg-time">{new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}</div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="message-row bot">
      <div className="msg-avatar"><Bot size={16} /></div>
      <div className="msg-bubble typing">
        <span /><span /><span />
      </div>
    </div>
  );
}

export default function Chatbot() {
  const { user, api } = useAuth();
  const [messages, setMessages] = useState([{
    id: 0,
    role: 'assistant',
    content: `Hey ${user?.name?.split(' ')[0] || 'Athlete'}! 👋 I'm **FitBot**, your AI fitness coach.\n\nI know your profile — ${user?.gender || ''} ${user?.age ? user.age + ' years old' : ''}, ${user?.weight ? user.weight + 'kg' : ''} ${user?.height ? '/ ' + user.height + 'cm' : ''}, aiming for **${user?.fitness_goal?.replace('_',' ') || 'general fitness'}**.\n\nI'm here to give you a **personalized workout plan**, calculate your **perfect macros**, suggest **recovery strategies**, and keep you motivated! 💪\n\nWhat can I help you with today?`,
    timestamp: Date.now(),
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const content = text || input.trim();
    if (!content || loading) return;
    setInput('');

    const userMsg = { id: Date.now(), role: 'user', content, timestamp: Date.now() };
    setMessages(m => [...m, userMsg]);
    setLoading(true);

    try {
      await api.post('/user/chat', { role: 'user', content });

      const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
      if (!apiKey) {
        throw new Error('OpenRouter API key not configured. Set VITE_OPENROUTER_API_KEY in .env');
      }

      const historyForAPI = messages
        .filter(m => m.id !== 0)
        .map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }));
      historyForAPI.push({ role: 'user', content });

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'FitQuest'
        },
        body: JSON.stringify({
          model: 'openai/gpt-3.5-turbo',
          max_tokens: 1000,
          system: SYSTEM_PROMPT(user),
          messages: historyForAPI,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenRouter API Error:', errorData);
        throw new Error(errorData.error?.message || `OpenRouter API error: ${response.status}`);
      }

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';

      const botMsg = { id: Date.now() + 1, role: 'assistant', content: reply, timestamp: Date.now() };
      setMessages(m => [...m, botMsg]);

      await api.post('/user/chat', { role: 'assistant', content: reply });
    } catch (err) {
      toast.error('FitBot is temporarily unavailable. Please try again.');
      setMessages(m => [...m, {
        id: Date.now() + 1,
        role: 'assistant',
        content: '⚠️ I\'m having a moment of downtime. Please try again shortly!',
        timestamp: Date.now(),
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const clearChat = async () => {
    try {
      await api.delete('/user/chat');
      setMessages([{
        id: Date.now(),
        role: 'assistant',
        content: `Chat cleared! Ready for a fresh start, ${user?.name?.split(' ')[0] || 'Athlete'}! 💪 What would you like to work on?`,
        timestamp: Date.now(),
      }]);
    } catch { toast.error('Failed to clear chat'); }
  };

  return (
    <div className="chatbot-page animate-fade-in">
      <div className="chatbot-layout">
        <div className="chat-sidebar">
          <div className="chat-sidebar-header">
            <Zap size={16} color="var(--accent)" />
            <span>Quick Prompts</span>
          </div>
          <div className="quick-prompts">
            {QUICK_PROMPTS.map(p => (
              <button key={p.label} className="quick-prompt-btn" onClick={() => sendMessage(p.text)} disabled={loading}>
                {p.label}
              </button>
            ))}
          </div>
          <div className="chat-sidebar-divider" />
          <div className="profile-chip">
            <div className="pc-avatar">{user?.name?.charAt(0)}</div>
            <div>
              <span className="pc-name">{user?.name}</span>
              <span className="pc-goal">{user?.fitness_goal?.replace('_', ' ')}</span>
            </div>
          </div>
          <button className="btn btn-ghost btn-full btn-sm" onClick={clearChat} style={{ marginTop: 8 }}>
            <Trash2 size={14} /> Clear Chat
          </button>
        </div>

        <div className="chat-main">
          <div className="chat-messages">
            {messages.map(msg => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
            {loading && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          <div className="chat-input-area">
            <div className="chat-input-wrap">
              <input
                ref={inputRef}
                className="chat-input"
                placeholder="Ask FitBot anything about fitness..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && sendMessage()}
                disabled={loading}
              />
              <button
                className="chat-send-btn"
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```</content>
<parameter name="filePath">c:\Users\Sarthak Jaiswal\Downloads\FitQuest-v2\FitQuest\Chapter5_Implementation_Coding.md
