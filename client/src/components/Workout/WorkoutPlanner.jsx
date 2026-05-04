import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Plus, Trash2, Dumbbell, Clock, Flame, ChevronDown, ChevronUp, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import './Workout.css';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const MUSCLE_GROUPS = ['Chest','Back','Shoulders','Biceps','Triceps','Core','Quads','Hamstrings','Glutes','Calves','Full Body','Cardio'];
const INTENSITY_LEVELS = [
  { value:'light',    label:'Light',    color:'#2ed573', desc:'Recovery / warm-up' },
  { value:'moderate', label:'Moderate', color:'#ffa502', desc:'Standard training' },
  { value:'high',     label:'High',     color:'#ff4757', desc:'Push your limits' },
];

const TEMPLATE_PLANS = [
  { name:'Push Day', day:'Monday', intensity:'high', duration:60, exercises:[
    { name:'Bench Press', sets:4, reps:'8-10', rest:90, muscle:'Chest' },
    { name:'Overhead Press', sets:3, reps:'8-12', rest:75, muscle:'Shoulders' },
    { name:'Incline Dumbbell Press', sets:3, reps:'10-12', rest:60, muscle:'Chest' },
    { name:'Lateral Raises', sets:3, reps:'12-15', rest:45, muscle:'Shoulders' },
    { name:'Tricep Pushdowns', sets:3, reps:'12-15', rest:45, muscle:'Triceps' },
  ]},
  { name:'Pull Day', day:'Wednesday', intensity:'high', duration:60, exercises:[
    { name:'Deadlift', sets:4, reps:'5-6', rest:120, muscle:'Back' },
    { name:'Pull-Ups', sets:4, reps:'6-10', rest:90, muscle:'Back' },
    { name:'Barbell Rows', sets:3, reps:'8-10', rest:75, muscle:'Back' },
    { name:'Face Pulls', sets:3, reps:'15-20', rest:45, muscle:'Shoulders' },
    { name:'Bicep Curls', sets:3, reps:'10-12', rest:45, muscle:'Biceps' },
  ]},
  { name:'Leg Day', day:'Friday', intensity:'high', duration:65, exercises:[
    { name:'Squats', sets:4, reps:'6-8', rest:120, muscle:'Quads' },
    { name:'Romanian Deadlift', sets:3, reps:'8-10', rest:90, muscle:'Hamstrings' },
    { name:'Leg Press', sets:3, reps:'10-12', rest:75, muscle:'Quads' },
    { name:'Walking Lunges', sets:3, reps:'12 each', rest:60, muscle:'Glutes' },
    { name:'Calf Raises', sets:4, reps:'15-20', rest:30, muscle:'Calves' },
  ]},
  { name:'Core & Cardio', day:'Saturday', intensity:'moderate', duration:45, exercises:[
    { name:'Plank', sets:3, reps:'60 sec', rest:30, muscle:'Core' },
    { name:'Crunches', sets:3, reps:'20', rest:30, muscle:'Core' },
    { name:'Mountain Climbers', sets:3, reps:'30 sec', rest:30, muscle:'Core' },
    { name:'Jump Rope', sets:5, reps:'2 min', rest:60, muscle:'Cardio' },
  ]},
];

const BLANK_EXERCISE = { name:'', sets:3, reps:'10', rest:60, muscle:'Chest' };

export default function WorkoutPlanner() {
  const { api } = useAuth();
  const [plans, setPlans] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [expandedPlan, setExpandedPlan] = useState(null);
  const [saving, setSaving] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name:'', day:'Monday', intensity:'moderate', duration:45, description:'', exercises:[{ ...BLANK_EXERCISE }]
  });

  useEffect(() => {
    api.get('/user/workouts').then(r => setPlans(r.data.plans)).catch(() => {});
  }, [api]);

  const addExercise = () => setNewPlan(p => ({ ...p, exercises: [...p.exercises, { ...BLANK_EXERCISE }] }));
  const removeExercise = i => setNewPlan(p => ({ ...p, exercises: p.exercises.filter((_,idx) => idx !== i) }));
  const updateExercise = (i, field, value) => setNewPlan(p => ({
    ...p, exercises: p.exercises.map((e, idx) => idx === i ? { ...e, [field]: value } : e)
  }));

  const savePlan = async () => {
    if (!newPlan.name || newPlan.exercises.length === 0) return toast.error('Add a name and at least one exercise');
    setSaving(true);
    try {
      const r = await api.post('/user/workouts', newPlan);
      setPlans(p => [r.data.plan, ...p]);
      setNewPlan({ name:'', day:'Monday', intensity:'moderate', duration:45, description:'', exercises:[{ ...BLANK_EXERCISE }] });
      setShowForm(false);
      toast.success('Workout plan saved! 💪');
    } catch { toast.error('Failed to save workout'); }
    finally { setSaving(false); }
  };

  const deletePlan = async (id) => {
    try {
      await api.delete(`/user/workouts/${id}`);
      setPlans(p => p.filter(pl => pl.id !== id));
      toast.success('Plan deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const loadTemplate = (t) => {
    setNewPlan({ name: t.name, day: t.day, intensity: t.intensity, duration: t.duration, description: `${t.name} template`, exercises: t.exercises });
    setShowForm(true);
    toast.success(`Template "${t.name}" loaded!`);
  };

  const getIntensityColor = v => INTENSITY_LEVELS.find(i => i.value === v)?.color || 'var(--accent)';

  return (
    <div className="workout-page animate-fade-in">
      <div className="workout-toolbar">
        <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
          <Plus size={16} /> {showForm ? 'Cancel' : 'New Workout Plan'}
        </button>
        <span style={{ fontSize:'0.85rem', color:'var(--text-muted)', fontFamily:'var(--font-condensed)', fontWeight:600 }}>
          {plans.length} plan{plans.length !== 1 ? 's' : ''} saved
        </span>
      </div>

      {!showForm && plans.length === 0 && (
        <div className="templates-section">
          <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.3rem', marginBottom: 6 }}>Quick Start Templates</h3>
          <p style={{ fontSize:'0.85rem', color:'var(--text-muted)', marginBottom: 20 }}>Load a professional workout template to get started fast</p>
          <div className="grid-4" style={{ gap: 14 }}>
            {TEMPLATE_PLANS.map(t => (
              <div key={t.name} className="template-card card" onClick={() => loadTemplate(t)}>
                <div className="template-icon"><Dumbbell size={24} /></div>
                <h4 className="template-name">{t.name}</h4>
                <div className="template-meta">
                  <span>{t.day}</span>
                  <span>{t.duration} min</span>
                  <span style={{ color: getIntensityColor(t.intensity) }}>{t.intensity}</span>
                </div>
                <div className="template-exercises">{t.exercises.length} exercises</div>
                <div className="template-overlay">Load Template →</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showForm && (
        <div className="card workout-form animate-fade-up">
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.4rem', marginBottom: 20 }}>Build Your Workout</h2>
          <div className="grid-2" style={{ gap: 14, marginBottom: 14 }}>
            <div className="form-group">
              <label className="form-label">Plan Name</label>
              <input className="form-input" placeholder="e.g. Push Day A" value={newPlan.name}
                onChange={e => setNewPlan(p => ({...p, name: e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">Day</label>
              <select className="form-select" value={newPlan.day}
                onChange={e => setNewPlan(p => ({...p, day: e.target.value}))}>
                {DAYS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Duration (min)</label>
              <input className="form-input" type="number" value={newPlan.duration}
                onChange={e => setNewPlan(p => ({...p, duration: +e.target.value}))} min="10" />
            </div>
            <div className="form-group">
              <label className="form-label">Intensity</label>
              <div style={{ display:'flex', gap: 8 }}>
                {INTENSITY_LEVELS.map(il => (
                  <button key={il.value} type="button" style={{ flex:1 }}
                    className={`intensity-btn ${newPlan.intensity===il.value?'active':''}`}
                    onClick={() => setNewPlan(p => ({...p, intensity: il.value}))}
                    data-color={il.color}>
                    <span style={{ color: il.color }}>{il.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="form-label">Notes (optional)</label>
            <textarea className="form-textarea" placeholder="Any notes about this session..." rows={2}
              value={newPlan.description}
              onChange={e => setNewPlan(p => ({...p, description: e.target.value}))} />
          </div>

          <div className="exercises-section">
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 14 }}>
              <h3 style={{ fontFamily:'var(--font-condensed)', fontSize:'1rem', fontWeight: 700, letterSpacing: '0.06em', textTransform:'uppercase', color:'var(--text-muted)' }}>
                Exercises ({newPlan.exercises.length})
              </h3>
              <button className="btn btn-secondary btn-sm" onClick={addExercise}>
                <Plus size={14} /> Add Exercise
              </button>
            </div>
            <div className="exercise-list">
              {newPlan.exercises.map((ex, i) => (
                <div key={i} className="exercise-row">
                  <div className="ex-num">{i+1}</div>
                  <div className="ex-fields">
                    <input className="form-input" placeholder="Exercise name" value={ex.name}
                      onChange={e => updateExercise(i, 'name', e.target.value)} style={{ gridColumn:'1 / 3' }} />
                    <select className="form-select" value={ex.muscle}
                      onChange={e => updateExercise(i, 'muscle', e.target.value)}>
                      {MUSCLE_GROUPS.map(m => <option key={m}>{m}</option>)}
                    </select>
                    <input className="form-input" placeholder="Sets" type="number" value={ex.sets}
                      onChange={e => updateExercise(i, 'sets', +e.target.value)} min="1" />
                    <input className="form-input" placeholder="Reps" value={ex.reps}
                      onChange={e => updateExercise(i, 'reps', e.target.value)} />
                    <input className="form-input" placeholder="Rest (sec)" type="number" value={ex.rest}
                      onChange={e => updateExercise(i, 'rest', +e.target.value)} />
                  </div>
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => removeExercise(i)} disabled={newPlan.exercises.length === 1}>
                    <Trash2 size={14} color="var(--danger)" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display:'flex', gap: 12, marginTop: 20 }}>
            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn btn-primary btn-lg" style={{ flex:1 }} onClick={savePlan} disabled={saving}>
              {saving ? <span className="spinner" /> : <><Save size={16} /> Save Workout Plan</>}
            </button>
          </div>
        </div>
      )}

      {plans.length > 0 && (
        <div className="plans-section" style={{ marginTop: showForm ? 28 : 0 }}>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.4rem', marginBottom: 20 }}>
            Your Workout Plans
          </h2>
          <div className="plans-week-grid">
            {DAYS.map(day => {
              const dayPlans = plans.filter(p => p.day_of_week === day);
              return (
                <div key={day} className="day-column">
                  <div className="day-header">{day.slice(0,3).toUpperCase()}</div>
                  {dayPlans.length === 0 ? (
                    <div className="day-rest">REST</div>
                  ) : (
                    dayPlans.map(plan => (
                      <div key={plan.id} className="plan-card"
                        style={{ borderLeft: `3px solid ${getIntensityColor(plan.intensity)}` }}>
                        <div className="plan-card-header">
                          <span className="plan-name">{plan.name}</span>
                          <button className="btn btn-ghost btn-icon" style={{padding: 4}}
                            onClick={() => deletePlan(plan.id)}>
                            <Trash2 size={12} color="var(--danger)" />
                          </button>
                        </div>
                        <div className="plan-meta">
                          <span><Clock size={10} /> {plan.duration_minutes}m</span>
                          <span style={{ color: getIntensityColor(plan.intensity) }}>{plan.intensity}</span>
                        </div>
                        <button className="plan-expand"
                          onClick={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}>
                          {expandedPlan === plan.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          {plan.exercises?.length} exercises
                        </button>
                        {expandedPlan === plan.id && (
                          <div className="plan-exercises">
                            {plan.exercises?.map((ex, i) => (
                              <div key={i} className="plan-ex-item">
                                <span className="ex-badge">{ex.sets}×{ex.reps}</span>
                                <span className="ex-name">{ex.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
