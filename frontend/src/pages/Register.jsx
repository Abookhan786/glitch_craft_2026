import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Users } from 'lucide-react';

function RegisterField({ label, name, type = 'text', placeholder, required = false, value, onChange }) {
  return (
    <div>
      <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-secondary)', letterSpacing: '0.1em', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
        {label} {required && <span style={{ color: 'var(--neon-pink)' }}>*</span>}
      </label>
      <input
        type={type}
        required={required}
        className="input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', country: '' });
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      toast.success('Team registered! Welcome to GlitchCraft.');
      navigate('/challenges');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 62px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{ width: '100%', maxWidth: '460px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <div style={{ width: 64, height: 64, border: '2px solid var(--neon-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--glow-green)' }}>
              <Users size={32} color="var(--neon-green)" />
            </div>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--neon-green)', marginBottom: '0.4rem' }}>
            REGISTER TEAM
          </h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            Join the investigation
          </p>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-bright)', padding: '2rem', position: 'relative' }}>
          {/* Scan line effect */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
            background: 'linear-gradient(90deg, transparent, var(--neon-green), transparent)',
          }} />

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <RegisterField label="Team Name" name="name" placeholder="CyberSleuth42" required value={form.name} onChange={set('name')} />
            <RegisterField label="Email" name="email" type="email" placeholder="team@example.com" required value={form.email} onChange={set('email')} />
            <RegisterField label="Password" name="password" type="password" placeholder="Min. 8 characters" required value={form.password} onChange={set('password')} />
            <RegisterField label="Country (optional)" name="country" placeholder="India" value={form.country} onChange={set('country')} />

            {/* Password strength */}
            {form.password && (
              <div style={{ display: 'flex', gap: '4px' }}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} style={{
                    flex: 1, height: 3,
                    background: i < Math.min(Math.floor(form.password.length / 4), 4)
                      ? (form.password.length < 8 ? 'var(--neon-orange)' : form.password.length < 12 ? 'var(--neon-yellow)' : 'var(--neon-green)')
                      : 'var(--border)',
                    transition: 'background 0.3s',
                  }} />
                ))}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn btn-solid-green" style={{
              width: '100%', padding: '0.85rem', fontSize: '0.8rem',
              marginTop: '0.5rem', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer',
            }}>
              {loading ? 'Registering...' : '[ CREATE TEAM ]'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
          Already registered?{' '}
          <Link to="/login" style={{ color: 'var(--neon-cyan)' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
