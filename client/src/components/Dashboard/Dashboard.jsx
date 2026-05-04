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

  return (
    <div className="dashboard animate-fade-in">
      <div className="dashboard-hero">
        <div className="hero-text">
          <span className="hero-greeting">{greeting},</span>
          <h1 className="hero-name">{user?.name?.split(' ')[0] || 'Athlete'} <span>💪</span></h1>
          <p className="hero-tip">{tip}</p>
        </div>
        <div className="hero-badge">
          <Award size={32} />
          <div>
            <span className="badge-title">Current Streak</span>
            <span className="badge-value">7 Days 🔥</span>
          </div>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: 28 }}>
        {[
          { label: 'BMI Score', value: bmi || '--', unit: bmiCategory || 'Not set', icon: Activity, color: '#00e5ff' },
          { label: 'Daily Calories', value: tdee ? tdee.toLocaleString() : '--', unit: 'kcal target', icon: Flame, color: '#ff9f43' },
          { label: 'Body Weight', value: user?.weight || '--', unit: 'kg', icon: TrendingUp, color: '#c8f135' },
          { label: 'Water Goal', value: '2.5', unit: 'litres / day', icon: Droplets, color: '#a29bfe' },
        ].map(({ label, value, unit, icon: Icon, color }, i) => (
          <div key={label} className="stat-card animate-fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="stat-card-icon" style={{ background: color + '18', color }}>
              <Icon size={20} />
            </div>
            <div className="stat-label">{label}</div>
            <div className="stat-value">{value}</div>
            <div className="stat-unit">{unit}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="card dashboard-chart-card">
          <div className="section-header" style={{ marginBottom: 16 }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}>Weekly Overview</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>Calories intake vs burned</p>
            </div>
            <div style={{ display:'flex', gap:12 }}>
              <span style={{ fontSize:'0.78rem', color:'var(--accent)', fontFamily:'var(--font-condensed)', fontWeight:600 }}>● Intake</span>
              <span style={{ fontSize:'0.78rem', color:'var(--accent2)', fontFamily:'var(--font-condensed)', fontWeight:600 }}>● Burned</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={WEEKLY_DATA} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="cG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="bG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent2)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--accent2)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-condensed)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'var(--font-condensed)' }} />
              <Area type="monotone" dataKey="calories" stroke="var(--accent)" fill="url(#cG)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="burned" stroke="var(--accent2)" fill="url(#bG)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card goal-progress-card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: 8 }}>Weekly Goal</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 16 }}>72% complete this week</p>
          <div className="radial-wrap">
            <ResponsiveContainer width="100%" height={160}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={radialData} startAngle={220} endAngle={-40}>
                <RadialBar dataKey="value" cornerRadius={10} background={{ fill: 'var(--bg-secondary)' }} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="radial-center">
              <span className="radial-value">72%</span>
              <span className="radial-label">Done</span>
            </div>
          </div>
          <div className="goal-details">
            {[
              { label: 'Workouts', done: 4, total: 5, color: 'var(--accent)' },
              { label: 'Water (L)', done: 16, total: 21, color: 'var(--accent2)' },
              { label: 'Calories', done: 13000, total: 17500, color: '#ff9f43' },
            ].map(g => (
              <div key={g.label} style={{ marginBottom: 10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize:'0.8rem', fontFamily:'var(--font-condensed)', fontWeight:600, color:'var(--text-secondary)' }}>{g.label}</span>
                  <span style={{ fontSize:'0.75rem', color: g.color, fontFamily:'var(--font-mono)' }}>{g.done}/{g.total}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(g.done/g.total)*100}%`, background: g.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 28 }}>
        <div className="section-header">
          <div>
            <h2 className="section-title">Quick Actions</h2>
            <p className="section-subtitle">Jump into your fitness tools</p>
          </div>
        </div>
        <div className="quick-actions-grid">
          {QUICK_ACTIONS.map(({ to, icon: Icon, label, color, bg }, i) => (
            <Link key={to} to={to} className="quick-action-card animate-fade-up" style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="qa-icon" style={{ background: bg, color }}>
                <Icon size={24} />
              </div>
              <span className="qa-label">{label}</span>
              <ArrowRight size={14} className="qa-arrow" />
            </Link>
          ))}
        </div>
      </div>

      {user && (
        <div className="card profile-summary animate-fade-up" style={{ marginTop: 28 }}>
          <div className="ps-header">
            <Zap size={18} color="var(--accent)" />
            <h3>Your Profile Summary</h3>
          </div>
          <div className="ps-grid">
            {[
              { label: 'Goal',     value: user.fitness_goal?.replace('_',' ') || 'General Fitness' },
              { label: 'Activity', value: user.activity_level?.replace('_',' ') || 'Moderate' },
              { label: 'Gender',   value: user.gender || 'Not set' },
              { label: 'Age',      value: user.age ? `${user.age} years` : 'Not set' },
              { label: 'Height',   value: user.height ? `${user.height} cm` : 'Not set' },
              { label: 'TDEE',     value: tdee ? `${tdee} kcal` : 'Not set' },
            ].map(({ label, value }) => (
              <div key={label} className="ps-item">
                <span className="ps-label">{label}</span>
                <span className="ps-value">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
