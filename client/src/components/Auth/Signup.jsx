import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Eye, EyeOff, Zap, User, Mail, Lock, ArrowRight, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import './Auth.css';

const GOALS = [
  { value: 'weight_loss',    label: '🔥 Weight Loss' },
  { value: 'muscle_gain',    label: '💪 Muscle Gain' },
  { value: 'endurance',      label: '🏃 Endurance' },
  { value: 'flexibility',    label: '🧘 Flexibility' },
  { value: 'general',        label: '⚡ General Fitness' },
];

const ACTIVITY = [
  { value: 'sedentary',      label: 'Sedentary (desk job)' },
  { value: 'light',          label: 'Lightly active (1-3x/wk)' },
  { value: 'moderate',       label: 'Moderately active (3-5x/wk)' },
  { value: 'very_active',    label: 'Very active (6-7x/wk)' },
  { value: 'extra_active',   label: 'Extra active (athlete)' },
];

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

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <div className="brand-glow" />
        <div className="brand-content">
          <div className="brand-logo">
            <Zap size={36} />
            <span>FitQuest</span>
          </div>
          <h2 className="brand-headline">START YOUR<br />QUEST TODAY</h2>
          <p className="brand-tagline">
            Build your personalized fitness plan with AI coaching, video guidance, and smart tracking.
          </p>
          <div className="brand-features">
            {['🤖 AI Workout Coach','📊 Nutrition Tracker','🎥 Video Tutorials','📈 Progress Analytics','💬 Personal Chatbot'].map(f => (
              <div key={f} className="brand-feature">{f}</div>
            ))}
          </div>
        </div>
        <div className="brand-decoration">
          {['STRENGTH','ENDURANCE','POWER','SPEED','AGILITY'].map((w,i) => (
            <span key={w} className="deco-word" style={{ animationDelay: `${i * 0.8}s` }}>{w}</span>
          ))}
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-form-box animate-fade-up">
          <div className="auth-header">
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Step {step} of 2 — {step === 1 ? 'Account Details' : 'Your Profile'}</p>
            <div className="step-progress">
              <div className="step-bar" style={{ width: step === 1 ? '50%' : '100%' }} />
            </div>
          </div>

          {step === 1 ? (
            <form onSubmit={nextStep} className="auth-form">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="input-wrapper">
                  <User size={16} className="input-icon" />
                  <input className="form-input with-icon" type="text" name="name"
                    placeholder="Your full name" value={form.name} onChange={handle} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-wrapper">
                  <Mail size={16} className="input-icon" />
                  <input className="form-input with-icon" type="email" name="email"
                    placeholder="athlete@example.com" value={form.email} onChange={handle} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrapper">
                  <Lock size={16} className="input-icon" />
                  <input className="form-input with-icon"
                    type={showPw ? 'text' : 'password'} name="password"
                    placeholder="Min. 6 characters" value={form.password} onChange={handle} />
                  <button type="button" className="input-action" onClick={() => setShowPw(s => !s)}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-lg btn-full auth-btn">
                Continue <ArrowRight size={18} />
              </button>
            </form>
          ) : (
            <form onSubmit={submit} className="auth-form">
              <div className="grid-2" style={{gap:12}}>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-select" name="gender" value={form.gender} onChange={handle}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Age</label>
                  <input className="form-input" type="number" name="age" placeholder="25"
                    min="10" max="100" value={form.age} onChange={handle} />
                </div>
                <div className="form-group">
                  <label className="form-label">Weight (kg)</label>
                  <input className="form-input" type="number" name="weight" placeholder="70"
                    step="0.1" value={form.weight} onChange={handle} />
                </div>
                <div className="form-group">
                  <label className="form-label">Height (cm)</label>
                  <input className="form-input" type="number" name="height" placeholder="175"
                    value={form.height} onChange={handle} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Fitness Goal</label>
                <div className="goal-grid">
                  {GOALS.map(g => (
                    <button key={g.value} type="button"
                      className={`goal-chip ${form.fitness_goal === g.value ? 'active' : ''}`}
                      onClick={() => setForm(f => ({ ...f, fitness_goal: g.value }))}>
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Activity Level</label>
                <select className="form-select" name="activity_level" value={form.activity_level} onChange={handle}>
                  {ACTIVITY.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>Back</button>
                <button type="submit" className="btn btn-primary btn-lg" style={{ flex: 1 }} disabled={loading}>
                  {loading ? <span className="spinner" /> : <>Create Account <ArrowRight size={18} /></>}
                </button>
              </div>
            </form>
          )}

          <div className="auth-divider"><span>Already have an account?</span></div>
          <Link to="/login" className="btn btn-secondary btn-full">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
