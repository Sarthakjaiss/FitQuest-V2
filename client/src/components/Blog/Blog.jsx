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

  return (
    <div className="blog-page animate-fade-in">
      <div className="blog-header">
        <div>
          <h1 className="blog-title">Fitness Community</h1>
          <p className="blog-subtitle">Share your journey, inspire others, and grow together</p>
        </div>
        <Link to="/blog/create" className="btn btn-primary">
          <Plus size={18} /> New Post
        </Link>
      </div>

      <div className="blog-categories">
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            className={`cat-btn ${category === cat.value ? 'active' : ''}`}
            onClick={() => { setCategory(cat.value); setPage(1); }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div className="spinner" style={{ width: 40, height: 40, margin: '0 auto' }} />
        </div>
      ) : posts.length === 0 ? (
        <div className="empty-state" style={{ padding: '60px 20px' }}>
          <MessageCircle size={56} />
          <h3>No posts yet</h3>
          <p>Be the first to share your fitness journey!</p>
          <Link to="/blog/create" className="btn btn-primary" style={{ marginTop: 16 }}>
            Create First Post
          </Link>
        </div>
      ) : (
        <div className="posts-grid">
          {posts.map(post => (
            <div key={post._id} className="post-card card">
              {post.image && (
                <div className="post-image">
                  <img src={post.image} alt={post.title} loading="lazy" />
                </div>
              )}

              <div className="post-content">
                <div className="post-meta">
                  <div className="pm-left">
                    <span className="post-author">
                      <User size={14} /> {post.userName}
                    </span>
                    <span className="post-date">
                      <Calendar size={14} /> {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className={`post-category ${post.category}`}>
                    <Tag size={12} /> {post.category}
                  </span>
                </div>

                <h2 className="post-title">{post.title}</h2>
                <p className="post-excerpt">{post.content.substring(0, 150)}...</p>

                <div className="post-actions">
                  <Link to={`/blog/post/${post._id}`} className="btn btn-secondary btn-sm">
                    Read More
                  </Link>

                  <div className="post-stats">
                    <button
                      className={`stat-btn ${post.likes?.includes(user?._id) ? 'liked' : ''}`}
                      onClick={() => likePost(post._id)}
                    >
                      <Heart size={14} /> {post.likes?.length || 0}
                    </button>
                    <button className="stat-btn">
                      <MessageCircle size={14} /> {post.comments?.length || 0}
                    </button>
                  </div>

                  {post.userId === user?._id && (
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => deletePost(post._id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn-secondary btn-sm"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </button>
          <span className="page-info">
            Page {page} of {totalPages}
          </span>
          <button
            className="btn btn-secondary btn-sm"
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
