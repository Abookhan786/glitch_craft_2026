import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Target, Trophy, User, LogOut, Settings, Menu, X, Zap } from 'lucide-react';

export default function Navbar() {
  const { team, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  const navLinks = [
    { to: '/challenges', label: 'Challenges', icon: Target },
    { to: '/scoreboard', label: 'Scoreboard', icon: Trophy },
  ];

  if (isAdmin) navLinks.push({ to: '/admin', label: 'Admin', icon: Settings });

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: 'rgba(5, 12, 20, 0.95)',
      borderBottom: '1px solid var(--border)',
      backdropFilter: 'blur(12px)',
    }}>
      {/* Top accent line */}
      <div style={{ height: '2px', background: 'linear-gradient(90deg, var(--neon-pink), var(--neon-cyan), var(--neon-green))' }} />
      
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', height: '60px', gap: '2rem' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={28} color="var(--neon-cyan)" />
            <Zap size={12} color="var(--neon-pink)" style={{ position: 'absolute' }} />
          </div>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.1rem',
            fontWeight: 900,
            color: 'var(--neon-green)',
            letterSpacing: '0.1em',
            textShadow: 'var(--glow-green)',
          }}>
            GLITCH<span style={{ color: 'var(--neon-cyan)' }}>CRAFT</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flex: 1 }}>
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.4rem 0.9rem',
              fontFamily: 'var(--font-display)', fontSize: '0.7rem',
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: isActive(to) ? 'var(--neon-green)' : 'var(--text-secondary)',
              borderBottom: isActive(to) ? '2px solid var(--neon-green)' : '2px solid transparent',
              textDecoration: 'none', transition: 'all 0.2s',
              textShadow: isActive(to) ? 'var(--glow-green)' : 'none',
            }}>
              <Icon size={14} />
              {label}
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {team ? (
            <>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                padding: '0.4rem 0.8rem',
              }}>
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: 'var(--neon-green)',
                  boxShadow: 'var(--glow-green)',
                  animation: 'pulse-glow 2s ease-in-out infinite',
                }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--neon-cyan)' }}>
                  {team.name}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--neon-green)', marginLeft: '0.4rem' }}>
                  {team.score?.toLocaleString()}pts
                </span>
              </div>
              <Link to="/profile" title="Profile">
                <User size={18} color={isActive('/profile') ? 'var(--neon-cyan)' : 'var(--text-secondary)'} />
              </Link>
              <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer' }} title="Logout">
                <LogOut size={18} color="var(--text-secondary)" />
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-cyan" style={{ fontSize: '0.65rem', padding: '0.4rem 1rem' }}>Login</Link>
              <Link to="/register" className="btn btn-solid-green" style={{ fontSize: '0.65rem', padding: '0.4rem 1rem' }}>Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
