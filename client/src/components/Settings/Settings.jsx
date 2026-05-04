import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Save, User, Mail, Activity, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import './Settings.css';

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

export default function Settings() {
  const { user, updateProfile, api } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    gender: user?.gender || 'male',
    age: user?.age || '',
    weight: user?.weight || '',
    height: user?.height || '',
    fitness_goal: user?.fitness_goal || 'general',
    activity_level: user?.activity_level || 'moderate',
  });
  const [saving, setSaving] = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const save = async () => {
    if (!form.name) return toast.error('Name is required');
    
    setSaving(true);
    try {
      await updateProfile({
        name: form.name,
        gender: form.gender,
        age: form.age ? parseInt(form.age) : null,
        weight: form.weight ? parseFloat(form.weight) : null,
        height: form.height ? parseFloat(form.height) : null,
        fitness_goal: form.fitness_goal,
        activity_level: form.activity_level,
      });
      toast.success('Profile updated successfully! ✨');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-page animate-fade-in">
      <div className="settings-container">
        <div className="settings-header">
          <div className="sh-icon">
            <Zap size={24} />
          </div>
          <div>
            <h1 className="settings-title">Profile Settings</h1>
            <p className="settings-subtitle">Update your fitness profile and preferences</p>
          </div>
        </div>

        <div className="card settings-card">
          <div className="sc-header">
            <User size={18} color="var(--accent)" />
            <h2>Personal Information</h2>
          </div>

          <div className="grid-2" style={{ gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className="form-input"
                type="text"
                name="name"
                placeholder="Your full name"
                value={form.name}
                onChange={handle}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Gender</label>
              <select
                className="form-select"
                name="gender"
                value={form.gender}
                onChange={handle}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Age</label>
              <input
                className="form-input"
                type="number"
                name="age"
                placeholder="25"
                min="10"
                max="100"
                value={form.age}
                onChange={handle}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                disabled
                value={user?.email || ''}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                Cannot be changed
              </span>
            </div>
          </div>
        </div>

        <div className="card settings-card">
          <div className="sc-header">
            <Activity size={18} color="var(--accent2)" />
            <h2>Physical Metrics</h2>
          </div>

          <div className="grid-2" style={{ gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Weight (kg)</label>
              <input
                className="form-input"
                type="number"
                name="weight"
                placeholder="70"
                step="0.1"
                value={form.weight}
                onChange={handle}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Height (cm)</label>
              <input
                className="form-input"
                type="number"
                name="height"
                placeholder="175"
                value={form.height}
                onChange={handle}
              />
            </div>
          </div>

          {form.weight && form.height && (
            <div className="metrics-info">
              <span className="mi-label">Current BMI:</span>
              <span className="mi-value">
                {(form.weight / ((form.height / 100) ** 2)).toFixed(1)}
              </span>
            </div>
          )}
        </div>

        <div className="card settings-card">
          <div className="sc-header">
            <Zap size={18} color="var(--warning)" />
            <h2>Fitness Preferences</h2>
          </div>

          <div className="form-group">
            <label className="form-label">Primary Fitness Goal</label>
            <div className="goal-chips">
              {GOALS.map(g => (
                <button
                  key={g.value}
                  type="button"
                  className={`goal-chip ${form.fitness_goal === g.value ? 'active' : ''}`}
                  onClick={() => setForm(f => ({ ...f, fitness_goal: g.value }))}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ marginTop: 16 }}>
            <label className="form-label">Activity Level</label>
            <select
              className="form-select"
              name="activity_level"
              value={form.activity_level}
              onChange={handle}
            >
              {ACTIVITY.map(a => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            className="btn btn-primary btn-lg"
            style={{ flex: 1 }}
            onClick={save}
            disabled={saving}
          >
            {saving ? (
              <span className="spinner" />
            ) : (
              <>
                <Save size={18} /> Save Changes
              </>
            )}
          </button>
        </div>

        <div className="settings-info-box">
          <p>
            💡 Your profile helps us calculate your personalized TDEE, suggest appropriate workouts,
            and provide tailored nutrition recommendations through FitBot.
          </p>
        </div>
      </div>
    </div>
  );
}
