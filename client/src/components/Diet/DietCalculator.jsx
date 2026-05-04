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
        <div className="meals-section">
          <p style={{ color:'var(--text-secondary)', marginBottom: 24, fontSize:'0.92rem' }}>Balanced meal ideas for each time of day — pick what fits your macro targets.</p>
          <div className="grid-2" style={{ gap: 20 }}>
            {Object.entries(MEAL_IDEAS).map(([meal, ideas]) => (
              <div key={meal} className="card meal-card">
                <h3 className="meal-title">
                  {meal === 'breakfast' ? '🌅' : meal === 'lunch' ? '☀️' : meal === 'dinner' ? '🌙' : '🍎'} {meal.charAt(0).toUpperCase() + meal.slice(1)}
                </h3>
                <div className="meal-list">
                  {ideas.map(idea => (
                    <div key={idea} className="meal-item">
                      <span className="meal-dot" />
                      {idea}
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
