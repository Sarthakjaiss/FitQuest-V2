import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-strong)',
            fontFamily: 'var(--font-condensed)',
            fontWeight: 600,
            fontSize: '0.9rem',
            borderRadius: 'var(--radius-md)',
          },
          success: {
            iconTheme: { primary: 'var(--accent)', secondary: '#0a0a0f' },
          },
          error: {
            iconTheme: { primary: 'var(--danger)', secondary: '#fff' },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
