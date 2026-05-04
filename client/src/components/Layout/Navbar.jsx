import { useLocation } from 'react-router-dom';
import { Sun, Moon, Bell, Search, Menu } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import './Navbar.css';

const PAGE_TITLES = {
  '/dashboard': { title: 'Dashboard',     sub: 'Your fitness overview' },
  '/bmi':       { title: 'BMI Tracker',   sub: 'Track your body mass index' },
  '/diet':      { title: 'Diet & Macros', sub: 'Nutrition & calorie planner' },
  '/workout':   { title: 'Workout Plan',  sub: 'Build your training schedule' },
  '/videos':    { title: 'Exercise Form', sub: 'Perfect your technique' },
  '/chatbot':   { title: 'AI Coach',      sub: 'Personalized fitness guidance' },
};

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { pathname } = useLocation();

  const { title, sub } = PAGE_TITLES[pathname] || { title: 'FitQuest', sub: '' };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <div className="page-title-group">
          <h1 className="page-title">{title}</h1>
          {sub && <span className="page-subtitle">{sub}</span>}
        </div>
      </div>

      <div className="navbar-right">
        <button
          className="btn btn-ghost btn-icon nav-action"
          onClick={toggleTheme}
          data-tooltip={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        >
          {theme === 'dark'
            ? <Sun size={18} color="var(--warning)" />
            : <Moon size={18} />
          }
        </button>

        <button className="btn btn-ghost btn-icon nav-action" data-tooltip="Notifications">
          <Bell size={18} />
          <span className="notif-dot" />
        </button>

        <div className="navbar-user">
          <div className="nav-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
        </div>
      </div>
    </header>
  );
}
