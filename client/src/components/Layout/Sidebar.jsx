import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  LayoutDashboard, Calculator, Salad, Dumbbell,
  PlaySquare, Bot, LogOut, Zap, ChevronRight, MessageSquare, Settings
} from 'lucide-react';
import './Sidebar.css';

const NAV_ITEMS = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard',     color: '#c8f135' },
  { to: '/settings',   icon: Settings,       label: 'Settings',      color: '#00e5ff' },
  { to: '/bmi',        icon: Calculator,      label: 'BMI Tracker',   color: '#00e5ff' },
  { to: '/diet',       icon: Salad,           label: 'Diet & Macros', color: '#ff9f43' },
  { to: '/workout',    icon: Dumbbell,        label: 'Workout Plan',  color: '#ff4757' },
  { to: '/videos',     icon: PlaySquare,      label: 'Exercise Form', color: '#a29bfe' },
  { to: '/blog',       icon: MessageSquare,   label: 'Community',     color: '#2ed573' },
  { to: '/chatbot',    icon: Bot,             label: 'AI Coach',      color: '#2ed573' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Zap size={22} className="logo-icon" />
        <span className="logo-text">FitQuest</span>
      </div>

      <div className="sidebar-user">
        <div className="user-avatar">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="user-info">
          <span className="user-name">{user?.name || 'Athlete'}</span>
          <span className="user-goal">{user?.fitness_goal?.replace('_',' ') || 'General Fitness'}</span>
        </div>
      </div>

      <div className="sidebar-section-label">Navigation</div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ to, icon: Icon, label, color }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon" style={{ '--nav-color': color }}>
              <Icon size={18} />
            </span>
            <span className="nav-label">{label}</span>
            <ChevronRight size={14} className="nav-arrow" />
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="btn btn-ghost btn-full" onClick={handleLogout} style={{ justifyContent: 'flex-start', gap: 12 }}>
          <LogOut size={16} />
          <span style={{ fontFamily: 'var(--font-condensed)', fontWeight: 600 }}>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
