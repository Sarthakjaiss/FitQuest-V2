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
