import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Send, Bot, User, Trash2, Zap, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import './Chatbot.css';

const SYSTEM_PROMPT = (user) => `You are FitBot, an elite personal fitness coach and nutritionist AI embedded in the FitQuest fitness app. 

USER PROFILE:
- Name: ${user?.name || 'Athlete'}
- Gender: ${user?.gender || 'not specified'}
- Age: ${user?.age || 'not specified'}
- Weight: ${user?.weight ? user.weight + ' kg' : 'not specified'}
- Height: ${user?.height ? user.height + ' cm' : 'not specified'}
- Fitness Goal: ${user?.fitness_goal?.replace('_',' ') || 'general fitness'}
- Activity Level: ${user?.activity_level?.replace('_',' ') || 'moderate'}

YOUR ROLE:
You provide personalized, science-based fitness and nutrition advice. Be energetic, motivating, and specific. Always consider the user's profile when giving advice. Use metrics/numbers wherever possible.

GUIDELINES:
- Give concrete, actionable workout plans with sets, reps, rest times
- Provide specific calorie and macro recommendations based on their stats
- Suggest exercises appropriate for their fitness level and goal
- Use encouraging language — celebrate their commitment
- Format workout plans clearly with bullet points or numbered lists
- When asked for a full workout plan, structure it by day (Mon-Sun)
- Include warm-up and cool-down recommendations
- Mention injury prevention and proper form tips
- Keep responses focused and practical

PERSONALITY: Enthusiastic, knowledgeable, supportive. Like a world-class personal trainer who genuinely cares about the user's success.`;

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

// Local fallback responder when no external API key is configured.
function generateLocalResponse(history, user, lastMessage) {
  const msg = (lastMessage || '').toLowerCase();

  // Macros / calories estimation
  if (/macro|calor|tdee|calorie/.test(msg)) {
    const weight = user?.weight;
    const height = user?.height;
    const age = user?.age;
    const sex = (user?.gender || '').toLowerCase();
    if (weight && height && age) {
      const s = sex.startsWith('m') ? 5 : -161;
      const bmr = Math.round(10 * weight + 6.25 * height - 5 * age + s);
      const activityMap = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
      const activityKey = (user?.activity_level || 'moderate').replace(/ /g, '_');
      const activity = activityMap[activityKey] || 1.55;
      const calories = Math.round(bmr * activity);
      const protein = Math.round(weight * 1.8);
      const fat = Math.round((calories * 0.25) / 9);
      const carbs = Math.round((calories - (protein * 4 + fat * 9)) / 4);
      return `Local FitBot (offline): Based on your profile, estimated daily calories: **${calories} kcal**.\n\nMacros: **Protein:** ${protein}g, **Carbs:** ${carbs}g, **Fat:** ${fat}g.`;
    }
    return 'Local FitBot (offline): I can estimate your calories and macros if you add weight, height, and age to your profile.';
  }

  // Workout / plan quick responder
  if (/workout|plan|hypertrophy|hiit|routine/.test(msg)) {
    return 'Local FitBot (offline): Quick 3-day sample plan:\n\n1. Day 1 - Upper: Bench 4x6-8, Rows 4x8-10, OHP 3x8-10, Pull-ups 3xMax\n\n2. Day 2 - Lower: Squat 4x6-8, RDL 3x8-10, Lunges 3x10 each\n\n3. Day 3 - Conditioning: 20-min circuit (burpees, kettlebell swings, jump rope).\n\nWarm up 5-10 minutes and cool down/stretch after sessions.';
  }

  // Generic fallback
  return "Local FitBot (offline): I'm running without an API key. I can answer basic fitness questions, give quick sample workouts, and estimate macros from your profile. Try asking: 'Calculate my daily macros' or 'Create a 3-day workout plan'.";
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
      // Save user message to DB
      await api.post('/user/chat', { role: 'user', content });

      // Build history for Claude API
      const historyForAPI = messages
        .filter(m => m.id !== 0)
        .map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }));
      historyForAPI.push({ role: 'user', content });

      // Call serverless proxy; server holds the OpenRouter key in `OPENROUTER_API_KEY`.
      let reply;
      try {
        const primaryModel = 'anthropic/claude-3.5-sonnet';
        const fallbackModel = 'openai/gpt-3.5-turbo';

        const sendChatRequest = async (model) => {
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model,
              max_tokens: 1000,
              system: SYSTEM_PROMPT(user),
              messages: historyForAPI,
              temperature: 0.7,
            }),
          });
          return response;
        };

        let response = await sendChatRequest(primaryModel);
        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          const errMsg = JSON.stringify(error).toLowerCase();

          if (response.status === 500 && errMsg.includes('openrouter api key')) {
            reply = generateLocalResponse(historyForAPI, user, content);
          } else if (errMsg.includes('no endpoints found') || errMsg.includes('not a valid model id')) {
            const fallbackResponse = await sendChatRequest(fallbackModel);
            if (fallbackResponse.ok) {
              const data = await fallbackResponse.json();
              reply = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
            } else {
              throw new Error((await fallbackResponse.json().catch(() => ({}))).error || 'API error');
            }
          } else {
            throw new Error(error?.error || 'API error');
          }
        } else {
          const data = await response.json();
          reply = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
        }
      } catch (e) {
        reply = generateLocalResponse(historyForAPI, user, content);
      }

      const botMsg = { id: Date.now() + 1, role: 'assistant', content: reply, timestamp: Date.now() };
      setMessages(m => [...m, botMsg]);

      // Save bot message to DB
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
        {/* Sidebar */}
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

        {/* Chat Window */}
        <div className="chat-window card">
          {/* Header */}
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

          {/* Messages */}
          <div className="messages-area">
            {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
            {loading && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
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
