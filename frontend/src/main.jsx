import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-bright)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
            },
            success: { iconTheme: { primary: 'var(--neon-green)', secondary: 'var(--bg-void)' } },
            error: { iconTheme: { primary: 'var(--neon-pink)', secondary: 'var(--bg-void)' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
