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

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <div className="brand-glow" />
        <div className="brand-content">
          <div className="brand-logo">
            <Zap size={36} />
            <span>FitQuest</span>
          </div>
          <h2 className="brand-headline">PUSH YOUR<br />LIMITS DAILY</h2>
          <p className="brand-tagline">
            AI-powered training, smart nutrition, and real-time coaching — all in one platform.
          </p>
          <div className="brand-stats">
            {[['10K+','Active Athletes'],['500+','Workout Plans'],['98%','Success Rate']].map(([v,l]) => (
              <div key={l} className="brand-stat">
                <span className="brand-stat-value">{v}</span>
                <span className="brand-stat-label">{l}</span>
              </div>
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
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Sign in to continue your journey</p>
          </div>

          <form onSubmit={submit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrapper">
                <Mail size={16} className="input-icon" />
                <input
                  className="form-input with-icon"
                  type="email"
                  name="email"
                  placeholder="athlete@example.com"
                  value={form.email}
                  onChange={handle}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <Lock size={16} className="input-icon" />
                <input
                  className="form-input with-icon"
                  type={showPw ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handle}
                  autoComplete="current-password"
                />
                <button type="button" className="input-action" onClick={() => setShowPw(s => !s)}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg btn-full auth-btn" disabled={loading}>
              {loading ? <span className="spinner" /> : <>Sign In <ArrowRight size={18} /></>}
            </button>
          </form>

          <div className="auth-divider"><span>New to FitQuest?</span></div>
          <Link to="/signup" className="btn btn-secondary btn-full">
            Create Your Account
          </Link>
        </div>
      </div>
    </div>
  );
}
