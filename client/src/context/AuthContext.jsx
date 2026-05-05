import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const apiBaseURL =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.DEV ? 'http://localhost:5000' : '');
const API = axios.create({ baseURL: `${apiBaseURL}/api` });

API.interceptors.request.use(cfg => {
  const token = localStorage.getItem('fq_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('fq_token');
    if (!token) { setLoading(false); return; }
    try {
      const { data } = await API.get('/auth/me');
      setUser(data.user);
    } catch {
      localStorage.removeItem('fq_token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    localStorage.setItem('fq_token', data.token);
    setUser(data.user);
    return data;
  };

  const register = async (formData) => {
    const { data } = await API.post('/auth/register', formData);
    localStorage.setItem('fq_token', data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('fq_token');
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    const { data } = await API.put('/auth/profile', profileData);
    setUser(data.user);
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, api: API }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
