import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Heart, MessageCircle, User, Calendar, ArrowLeft, Trash2, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BlogPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, api } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const { data } = await api.get(`/blog/posts/${id}`);
      setPost(data.post);
      setLiked(data.post.likes?.includes(user?._id));
    } catch {
      toast.error('Post not found');
      navigate('/blog');
    } finally {
      setLoading(false);
    }
  };

  const likePost = async () => {
    try {
      const { data } = await api.post(`/blog/posts/${id}/like`);
      setPost(data.post);
      setLiked(data.liked);
      toast.success(data.liked ? 'Liked! ❤️' : 'Unliked');
    } catch {
      toast.error('Failed');
    }
  };

  const submitComment = async e => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmitting(true);
    try {
      const { data } = await api.post(`/blog/posts/${id}/comments`, { content: commentText });
      setPost(p => ({ ...p, comments: [...p.comments, data.comment] }));
      setCommentText('');
      toast.success('Comment posted! 💬');
    } catch {
      toast.error('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteComment = async commentId => {
    if (!window.confirm('Delete comment?')) return;
    try {
      await api.delete(`/blog/posts/${id}/comments/${commentId}`);
      setPost(p => ({ ...p, comments: p.comments.filter(c => c._id !== commentId) }));
      toast.success('Comment deleted');
    } catch {
      toast.error('Failed to delete comment');
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="animate-fade-in">
      <button onClick={() => navigate('/blog')} className="btn btn-ghost" style={{ marginBottom: 20 }}>
        <ArrowLeft size={18} /> Back to Community
      </button>

      <div className="card" style={{ padding: 32, maxWidth: 900, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <span className={`badge badge-accent`}>
              {post.category}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'var(--font-condensed)', fontWeight: 600 }}>
              <Calendar size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', letterSpacing: '0.04em', marginBottom: 12 }}>
            {post.title}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <User size={14} /> {post.userName}
            </span>
          </div>
        </div>

        {post.image && (
          <div style={{ marginBottom: 24, borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <img src={post.image} alt={post.title} style={{ width: '100%', maxHeight: 400, objectFit: 'cover' }} />
          </div>
        )}

        <div style={{
          fontSize: '1rem',
          lineHeight: 1.8,
          color: 'var(--text-primary)',
          marginBottom: 32,
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word'
        }}>
          {post.content}
        </div>

        <div style={{ display: 'flex', gap: 16, padding: '20px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', marginBottom: 28 }}>
          <button
            onClick={likePost}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 16px',
              background: liked ? 'var(--accent-dim)' : 'var(--bg-secondary)',
              border: `1px solid ${liked ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-md)',
              color: liked ? 'var(--accent)' : 'var(--text-muted)',
              cursor: 'pointer',
              fontFamily: 'var(--font-condensed)',
              fontWeight: 600,
              transition: 'var(--transition)'
            }}
          >
            <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
            {post.likes?.length || 0}
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 16px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-condensed)',
            fontWeight: 600
          }}>
            <MessageCircle size={16} />
            {post.comments?.length || 0}
          </div>
        </div>

        <div>
          <h3 style={{ fontFamily: 'var(--font-condensed)', fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 20, color: 'var(--text-primary)' }}>
            Comments ({post.comments?.length || 0})
          </h3>

          {user && (
            <form onSubmit={submitComment} style={{ marginBottom: 24, padding: '16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
              <textarea
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Share your thoughts..."
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.95rem',
                  resize: 'vertical',
                  minHeight: 80,
                  outline: 'none'
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
              <button
                type="submit"
                disabled={submitting || !commentText.trim()}
                className="btn btn-primary"
                style={{ marginTop: 12 }}
              >
                {submitting ? <span className="spinner" /> : <><Send size={14} /> Post Comment</>}
              </button>
            </form>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {post.comments && post.comments.length > 0 ? (
              post.comments.map(comment => (
                <div key={comment._id} style={{
                  padding: '16px',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontFamily: 'var(--font-condensed)', fontWeight: 700, color: 'var(--text-primary)' }}>
                      <User size={12} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                      {comment.userName}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.6 }}>
                    {comment.content}
                  </p>
                  {comment.userId === user?._id && (
                    <button
                      onClick={() => deleteComment(comment._id)}
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '4px 8px' }}
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <MessageCircle size={40} style={{ opacity: 0.4, marginBottom: 12 }} />
                <p>No comments yet. Be the first to share!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
