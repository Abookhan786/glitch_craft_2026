import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [team, setTeam] = useState(() => {
    try {
      const stored = localStorage.getItem('gc_team');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('gc_token');
    if (token) {
      authAPI.getProfile()
        .then((res) => { setTeam(res.data); localStorage.setItem('gc_team', JSON.stringify(res.data)); })
        .catch(() => { logout(); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token, team } = res.data;
    localStorage.setItem('gc_token', token);
    localStorage.setItem('gc_team', JSON.stringify(team));
    setTeam(team);
    return team;
  }, []);

  const register = useCallback(async (data) => {
    const res = await authAPI.register(data);
    const { token, team } = res.data;
    localStorage.setItem('gc_token', token);
    localStorage.setItem('gc_team', JSON.stringify(team));
    setTeam(team);
    return team;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('gc_token');
    localStorage.removeItem('gc_team');
    setTeam(null);
  }, []);

  const updateTeam = useCallback((updates) => {
    setTeam((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('gc_team', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ team, loading, login, register, logout, updateTeam, isAdmin: team?.isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
