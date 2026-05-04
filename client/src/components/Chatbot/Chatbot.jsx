import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Send, Bot, User, Trash2, Zap, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import './Chatbot.css';

const QUICK_PROMPTS = [
  { label: '💪 Full Week Plan',   text: 'Create a complete 7-day workout plan for me based on my profile and fitness goal.' },
  { label: '🔥 Burn Fat Fast',    text: 'Design a fat-burning workout routine I can do this week with my current stats.' },
  { label: '🥗 My Daily Macros',  text: 'Calculate my ideal daily calories, protein, carbs, and fat based on my profile.' },
  { label: '🏋️ Build Muscle',     text: 'Give me a hypertrophy-focused training split and nutrition plan to build muscle.' },
  { label: '🧘 Recovery Day',     text: 'Suggest active recovery activities and stretches I can do on rest days.' },
  { label: '⚡ Quick 20-Min HIIT', text: 'Give me an intense 20-minute HIIT workout I can do anywhere with no equipment.' },
];

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`message-row ${isUser ? 'user' : 'bot'}`}>
      <div className="msg-avatar">
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>
      <div className="msg-bubble">
        <div className="msg-content" dangerouslySetInnerHTML={{
          __html: msg.content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/^### (.*$)/gm, '<h4>$1</h4>')
            .replace(/^## (.*$)/gm, '<h3>$1</h3>')
            .replace(/^# (.*$)/gm, '<h2>$1</h2>')
            .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
            .replace(/^- (.*$)/gm, '<li>$1</li>')
            .replace(/(<li>.*<\/li>\n?)+/g, s => `<ul>${s}</ul>`)
            .replace(/\n/g, '<br/>')
        }} />
        <div className="msg-time">{new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}</div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="message-row bot">
      <div className="msg-avatar"><Bot size={16} /></div>
      <div className="msg-bubble typing">
        <span /><span /><span />
      </div>
    </div>
  );
}

export default function Chatbot() {
  const { user, api } = useAuth();
  const [messages, setMessages] = useState([{
    id: 0,
    role: 'assistant',
    content: `Hey ${user?.name?.split(' ')[0] || 'Athlete'}! 👋 I'm **FitBot**, your AI fitness coach.\n\nI know your profile — ${user?.gender || ''} ${user?.age ? user.age + ' years old' : ''}, ${user?.weight ? user.weight + 'kg' : ''} ${user?.height ? '/ ' + user.height + 'cm' : ''}, aiming for **${user?.fitness_goal?.replace('_',' ') || 'general fitness'}**.\n\nI'm here to give you a **personalized workout plan**, calculate your **perfect macros**, suggest **recovery strategies**, and keep you motivated! 💪\n\nWhat can I help you with today?`,
    timestamp: Date.now(),
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const content = text || input.trim();
    if (!content || loading) return;
    setInput('');

    const userMsg = { id: Date.now(), role: 'user', content, timestamp: Date.now() };
    setMessages(m => [...m, userMsg]);
    setLoading(true);

    try {
      await api.post('/user/chat', { role: 'user', content });

      const historyForAPI = messages
        .filter(m => m.id !== 0)
        .map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }));
      const { data } = await api.post('/user/chat/ai', {
        content,
        history: historyForAPI,
      });
      const reply = data?.reply || 'Sorry, I could not generate a response.';

      const botMsg = { id: Date.now() + 1, role: 'assistant', content: reply, timestamp: Date.now() };
      setMessages(m => [...m, botMsg]);

      await api.post('/user/chat', { role: 'assistant', content: reply });
    } catch (err) {
      toast.error('FitBot is temporarily unavailable. Please try again.');
      setMessages(m => [...m, {
        id: Date.now() + 1,
        role: 'assistant',
        content: '⚠️ I\'m having a moment of downtime. Please try again shortly!',
        timestamp: Date.now(),
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const clearChat = async () => {
    try {
      await api.delete('/user/chat');
      setMessages([{
        id: Date.now(),
        role: 'assistant',
        content: `Chat cleared! Ready for a fresh start, ${user?.name?.split(' ')[0] || 'Athlete'}! 💪 What would you like to work on?`,
        timestamp: Date.now(),
      }]);
    } catch { toast.error('Failed to clear chat'); }
  };

  return (
    <div className="chatbot-page animate-fade-in">
      <div className="chatbot-layout">
        <div className="chat-sidebar">
          <div className="chat-sidebar-header">
            <Zap size={16} color="var(--accent)" />
            <span>Quick Prompts</span>
          </div>
          <div className="quick-prompts">
            {QUICK_PROMPTS.map(p => (
              <button key={p.label} className="quick-prompt-btn" onClick={() => sendMessage(p.text)} disabled={loading}>
                {p.label}
              </button>
            ))}
          </div>
          <div className="chat-sidebar-divider" />
          <div className="profile-chip">
            <div className="pc-avatar">{user?.name?.charAt(0)}</div>
            <div>
              <span className="pc-name">{user?.name}</span>
              <span className="pc-goal">{user?.fitness_goal?.replace('_', ' ')}</span>
            </div>
          </div>
          <button className="btn btn-ghost btn-full btn-sm" onClick={clearChat} style={{ marginTop: 8 }}>
            <Trash2 size={14} /> Clear Chat
          </button>
        </div>

        <div className="chat-window card">
          <div className="chat-header">
            <div className="chat-header-avatar">
              <Bot size={20} />
              <span className="online-dot" />
            </div>
            <div>
              <h3 className="chat-header-title">FitBot</h3>
              <span className="chat-header-sub">AI Personal Coach · Online</span>
            </div>
            <button className="btn btn-ghost btn-icon btn-sm" style={{ marginLeft:'auto' }} onClick={clearChat}>
              <RefreshCw size={14} />
            </button>
          </div>

          <div className="messages-area">
            {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
            {loading && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          <div className="chat-input-area">
            <input
              ref={inputRef}
              className="chat-input"
              placeholder="Ask FitBot anything about fitness, nutrition, workouts..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              disabled={loading}
            />
            <button
              className="send-btn"
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
            >
              {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : <Send size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
