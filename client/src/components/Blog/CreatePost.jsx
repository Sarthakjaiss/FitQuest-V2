import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { Send, Type, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { value: 'workout',    label: '🏋️ Workout' },
  { value: 'nutrition',  label: '🥗 Nutrition' },
  { value: 'motivation', label: '🔥 Motivation' },
  { value: 'tips',       label: '💡 Tips' },
  { value: 'general',    label: '💬 General' },
];

export default function CreateBlogPost() {
  const { api } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    content: '',
    category: 'general',
    image: ''
  });
  const [saving, setSaving] = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    if (!form.title || !form.content) return toast.error('Title and content required');

    setSaving(true);
    try {
      await api.post('/blog/posts', form);
      toast.success('Post published! 🎉');
      navigate('/blog');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create post');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 900, margin: '0 auto' }}>
      <div className="section-header" style={{ marginBottom: 28 }}>
        <div>
          <h1 className="section-title">Create New Post</h1>
          <p className="section-subtitle">Share your fitness story and inspire the community</p>
        </div>
      </div>

      <form onSubmit={submit} className="card" style={{ padding: 28 }}>
        <div className="form-group" style={{ marginBottom: 20 }}>
          <label className="form-label">Post Title</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Type size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 16, pointerEvents: 'none' }} />
            <input
              className="form-input"
              placeholder="e.g. My 30-Day Transformation Journey"
              name="title"
              value={form.title}
              onChange={handle}
              style={{ paddingLeft: 40 }}
            />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 20 }}>
          <label className="form-label">Content</label>
          <textarea
            className="form-textarea"
            placeholder="Share your story, tips, progress, and experiences..."
            name="content"
            value={form.content}
            onChange={handle}
            rows="12"
            style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem' }}
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6, display: 'block' }}>
            {form.content.length} characters
          </span>
        </div>

        <div className="grid-2" style={{ gap: 16, marginBottom: 20 }}>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-select" name="category" value={form.category} onChange={handle}>
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Image URL (optional)</label>
            <input
              className="form-input"
              placeholder="https://example.com/image.jpg"
              name="image"
              value={form.image}
              onChange={handle}
            />
          </div>
        </div>

        {form.image && (
          <div style={{ marginBottom: 20, borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <img src={form.image} alt="Preview" style={{ maxWidth: '100%', maxHeight: 300 }} />
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/blog')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ flex: 1 }}
            disabled={saving}
          >
            {saving ? <span className="spinner" /> : <><Send size={18} /> Publish Post</>}
          </button>
        </div>
      </form>

      <div className="card" style={{ padding: 20, marginTop: 20, background: 'var(--accent-dim)', border: '1px solid var(--accent)' }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.6 }}>
          💡 <strong>Tips for great posts:</strong> Share your personal experience, be authentic, add photos, provide actionable advice,
          and engage with the community by responding to comments.
        </p>
      </div>
    </div>
  );
}
