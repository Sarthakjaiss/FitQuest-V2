import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import AppLayout from './components/Layout/AppLayout.jsx';
import Login from './components/Auth/Login.jsx';
import Signup from './components/Auth/Signup.jsx';
import Dashboard from './components/Dashboard/Dashboard.jsx';
import Settings from './components/Settings/Settings.jsx';
import BMICalculator from './components/BMI/BMICalculator.jsx';
import DietCalculator from './components/Diet/DietCalculator.jsx';
import WorkoutPlanner from './components/Workout/WorkoutPlanner.jsx';
import ExerciseVideos from './components/Workout/ExerciseVideos.jsx';
import Chatbot from './components/Chatbot/Chatbot.jsx';
import Blog from './components/Blog/Blog.jsx';
import CreateBlogPost from './components/Blog/CreatePost.jsx';
import BlogPost from './components/Blog/BlogPost.jsx';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg-primary)' }}>
      <div className="spinner" style={{width:40,height:40}} />
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="settings" element={<Settings />} />
        <Route path="bmi" element={<BMICalculator />} />
        <Route path="diet" element={<DietCalculator />} />
        <Route path="workout" element={<WorkoutPlanner />} />
        <Route path="videos" element={<ExerciseVideos />} />
        <Route path="chatbot" element={<Chatbot />} />
        <Route path="blog" element={<Blog />} />
        <Route path="blog/create" element={<CreateBlogPost />} />
        <Route path="blog/post/:id" element={<BlogPost />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}
