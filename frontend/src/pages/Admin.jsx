import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import GlitchText from '../components/GlitchText';
import { Settings, Target, Users, BarChart2, Plus, Trash2, Edit3, RefreshCw, Shield } from 'lucide-react';

const NAV = [
  { to: '/admin', label: 'Overview', icon: BarChart2, exact: true },
  { to: '/admin/challenges', label: 'Challenges', icon: Target },
  { to: '/admin/teams', label: 'Teams', icon: Users },
  { to: '/admin/config', label: 'Config', icon: Settings },
];

function AdminNav() {
  const location = useLocation();
  return (
    <div style={{
      background: 'var(--bg-panel)', border: '1px solid var(--border)',
      padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', width: 200, flexShrink: 0,
    }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0.25rem 0.5rem', marginBottom: '0.5rem' }}>
        Admin Panel
      </div>
      {NAV.map(({ to, label, icon: Icon, exact }) => {
        const active = exact ? location.pathname === to : location.pathname.startsWith(to) && to !== '/admin';
        return (
          <Link key={to} to={to} style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            padding: '0.5rem 0.75rem',
            fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
            color: active ? 'var(--neon-cyan)' : 'var(--text-secondary)',
            background: active ? 'rgba(0, 212, 255, 0.08)' : 'transparent',
            borderLeft: active ? '2px solid var(--neon-cyan)' : '2px solid transparent',
            textDecoration: 'none', transition: 'all 0.2s',
          }}>
            <Icon size={14} />
            {label}
          </Link>
        );
      })}
    </div>
  );
}

function Overview() {
  const [data, setData] = useState({ teams: [], challenges: [] });
  useEffect(() => {
    Promise.all([adminAPI.getTeams(), adminAPI.getChallenges()])
      .then(([t, c]) => setData({ teams: t.data, challenges: c.data }));
  }, []);

  const stats = [
    { label: 'Teams', value: data.teams.filter(t => !t.isAdmin).length, color: 'var(--neon-cyan)' },
    { label: 'Challenges', value: data.challenges.filter(c => c.isActive).length, color: 'var(--neon-green)' },
    { label: 'Total Solves', value: data.challenges.reduce((sum, c) => sum + (c._count?.submissions || 0), 0), color: 'var(--neon-orange)' },
    { label: 'Top Score', value: Math.max(0, ...data.teams.map(t => t.score)), color: 'var(--neon-yellow)' },
  ];

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--neon-cyan)', marginBottom: '2rem', letterSpacing: '0.1em' }}>EVENT OVERVIEW</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {stats.map((s) => (
          <div key={s.label} style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: s.color }}>{s.value}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginTop: '0.25rem' }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChallengeAdmin() {
  const [challenges, setChallenges] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', difficulty: 'EASY', points: 100, flag: '', categoryId: '', isActive: true, isFeatured: false });
  const [saving, setSaving] = useState(false);

  const load = () => Promise.all([adminAPI.getChallenges(), adminAPI.getCategories()])
    .then(([c, cat]) => { setChallenges(c.data); setCategories(cat.data); });

  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminAPI.createChallenge({ ...form, points: parseInt(form.points) });
      toast.success('Challenge created!');
      setShowForm(false);
      setForm({ title: '', description: '', difficulty: 'EASY', points: 100, flag: '', categoryId: '', isActive: true, isFeatured: false });
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create challenge');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this challenge?')) return;
    await adminAPI.deleteChallenge(id);
    toast.success('Challenge removed');
    load();
  };

  const inputStyle = { background: 'var(--bg-deep)', border: '1px solid var(--border-bright)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', padding: '0.6rem 0.8rem', width: '100%', outline: 'none', fontSize: '0.85rem' };
  const labelStyle = { display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.3rem' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--neon-green)', letterSpacing: '0.1em' }}>CHALLENGES ({challenges.length})</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-green" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem' }}>
          <Plus size={14} /> New Challenge
        </button>
      </div>

      {showForm && (
        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--neon-green)', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--neon-green)', marginBottom: '1rem', fontSize: '0.85rem' }}>CREATE CHALLENGE</h3>
          <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div><label style={labelStyle}>Title *</label><input style={inputStyle} value={form.title} onChange={set('title')} required /></div>
            <div><label style={labelStyle}>Category *</label>
              <select style={inputStyle} value={form.categoryId} onChange={set('categoryId')} required>
                <option value="">Select...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '1/-1' }}><label style={labelStyle}>Description * (markdown supported)</label><textarea style={{ ...inputStyle, height: '100px', resize: 'vertical' }} value={form.description} onChange={set('description')} required /></div>
            <div><label style={labelStyle}>Difficulty</label>
              <select style={inputStyle} value={form.difficulty} onChange={set('difficulty')}>
                {['EASY','MEDIUM','HARD','INSANE'].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div><label style={labelStyle}>Points</label><input type="number" style={inputStyle} value={form.points} onChange={set('points')} min={1} max={10000} required /></div>
            <div style={{ gridColumn: '1/-1' }}><label style={labelStyle}>Flag * (exact match)</label><input style={inputStyle} value={form.flag} onChange={set('flag')} placeholder="GC{...}" required /></div>
            <div style={{ gridColumn: '1/-1', display: 'flex', gap: '2rem', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <input type="checkbox" checked={form.isActive} onChange={set('isActive')} />
                Active
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <input type="checkbox" checked={form.isFeatured} onChange={set('isFeatured')} />
                Featured
              </label>
            </div>
            <div style={{ gridColumn: '1/-1', display: 'flex', gap: '0.75rem' }}>
              <button type="submit" disabled={saving} className="btn btn-solid-green" style={{ opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving...' : 'Create Challenge'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-cyan">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {challenges.map((c) => (
          <div key={c.id} style={{
            display: 'flex', alignItems: 'center', gap: '1rem',
            background: 'var(--bg-panel)', border: '1px solid var(--border)',
            padding: '0.85rem 1rem',
            opacity: c.isActive ? 1 : 0.5,
          }}>
            <span style={{ fontSize: '1rem' }}>{c.category?.icon}</span>
            <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontWeight: 500 }}>{c.title}</span>
            <span className={`badge badge-${c.difficulty?.toLowerCase()}`}>{c.difficulty}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--neon-green)' }}>{c.points}pts</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-dim)' }}>{c._count?.submissions || 0} solves</span>
            <button onClick={() => handleDelete(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--neon-pink)', padding: 0 }}>
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function TeamAdmin() {
  const [teams, setTeams] = useState([]);
  const load = () => adminAPI.getTeams().then((r) => setTeams(r.data.filter(t => !t.isAdmin)));
  useEffect(() => { load(); }, []);

  const handleReset = async (id) => {
    if (!window.confirm('Reset team score?')) return;
    await adminAPI.resetTeam(id);
    toast.success('Team score reset');
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete team permanently?')) return;
    await adminAPI.deleteTeam(id);
    toast.success('Team deleted');
    load();
  };

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--neon-cyan)', marginBottom: '1.5rem', letterSpacing: '0.1em' }}>TEAMS ({teams.length})</h2>
      <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px 80px 80px 100px', padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
          <div>Team</div><div>Email</div><div>Solves</div><div>Score</div><div>Actions</div>
        </div>
        {teams.map((t) => (
          <div key={t.id} style={{ display: 'grid', gridTemplateColumns: '1fr 200px 80px 80px 100px', padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}>{t.name}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.email}</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)' }}>{t._count?.submissions || 0}</span>
            <span style={{ fontFamily: 'var(--font-display)', color: 'var(--neon-green)' }}>{t.score}</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => handleReset(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--neon-orange)' }} title="Reset score">
                <RefreshCw size={13} />
              </button>
              <button onClick={() => handleDelete(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--neon-pink)' }} title="Delete team">
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConfigAdmin() {
  const [config, setConfig] = useState({});
  const [saving, setSaving] = useState('');

  useEffect(() => { adminAPI.getConfig().then(r => setConfig(r.data)); }, []);

  const updateConfig = async (key, value) => {
    setSaving(key);
    try {
      await adminAPI.updateConfig(key, value);
      setConfig(prev => ({ ...prev, [key]: value }));
      toast.success('Config updated');
    } catch { toast.error('Failed to update'); }
    finally { setSaving(''); }
  };

  const configs = [
    { key: 'event_name', label: 'Event Name', type: 'text' },
    { key: 'event_start', label: 'Start Time', type: 'datetime-local' },
    { key: 'event_end', label: 'End Time', type: 'datetime-local' },
    { key: 'registration_open', label: 'Registration Open', type: 'toggle' },
    { key: 'scoreboard_visible', label: 'Scoreboard Visible', type: 'toggle' },
    { key: 'challenges_visible', label: 'Challenges Visible', type: 'toggle' },
  ];

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--neon-orange)', marginBottom: '1.5rem', letterSpacing: '0.1em' }}>EVENT CONFIG</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {configs.map(({ key, label, type }) => (
          <div key={key} style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{label}</label>
            {type === 'toggle' ? (
              <button
                onClick={() => updateConfig(key, config[key] === 'true' ? 'false' : 'true')}
                style={{
                  background: config[key] === 'true' ? 'rgba(0,255,136,0.15)' : 'transparent',
                  border: `1px solid ${config[key] === 'true' ? 'var(--neon-green)' : 'var(--border)'}`,
                  color: config[key] === 'true' ? 'var(--neon-green)' : 'var(--text-dim)',
                  padding: '0.4rem 1rem', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
                  transition: 'all 0.2s',
                }}
              >
                {config[key] === 'true' ? 'ENABLED' : 'DISABLED'}
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem', flex: 1, maxWidth: 350 }}>
                <input
                  type={type} value={config[key] || ''}
                  onChange={(e) => setConfig(prev => ({ ...prev, [key]: e.target.value }))}
                  style={{ background: 'var(--bg-deep)', border: '1px solid var(--border-bright)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', padding: '0.5rem 0.8rem', flex: 1, outline: 'none', fontSize: '0.8rem' }}
                />
                <button onClick={() => updateConfig(key, config[key])} className="btn btn-cyan" style={{ fontSize: '0.65rem', padding: '0.4rem 0.75rem', whiteSpace: 'nowrap' }}>
                  {saving === key ? '...' : 'Save'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Admin() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <Shield size={20} color="var(--neon-pink)" />
        <GlitchText text="ADMIN PANEL" tag="h1" style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--neon-pink)' }} />
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
        <AdminNav />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Routes>
            <Route index element={<Overview />} />
            <Route path="challenges" element={<ChallengeAdmin />} />
            <Route path="teams" element={<TeamAdmin />} />
            <Route path="config" element={<ConfigAdmin />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
