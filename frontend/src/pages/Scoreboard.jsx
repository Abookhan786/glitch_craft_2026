import { useState, useEffect } from 'react';
import { scoreAPI } from '../services/api';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../context/AuthContext';
import GlitchText from '../components/GlitchText';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Trophy, Wifi, WifiOff } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const RANK_COLORS = ['var(--neon-yellow)', 'var(--text-secondary)', 'var(--neon-orange)'];

const FLAG_EMOJIS = { IN: '🇮🇳', US: '🇺🇸', UK: '🇬🇧', AU: '🇦🇺', DE: '🇩🇪', JP: '🇯🇵', CN: '🇨🇳', BR: '🇧🇷', CA: '🇨🇦', FR: '🇫🇷' };

export default function Scoreboard() {
  const { team } = useAuth();
  const [scores, setScores] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liveUpdate, setLiveUpdate] = useState(null);
  const [connected, setConnected] = useState(false);
  const [tab, setTab] = useState('table'); // table | chart

  useEffect(() => {
    Promise.all([scoreAPI.getScoreboard(), scoreAPI.getHistory()])
      .then(([s, h]) => { setScores(s.data); setHistory(h.data); })
      .catch(() => toast.error('Failed to load scoreboard'))
      .finally(() => setLoading(false));
  }, []);

  useSocket({
    'scoreboard:update': (data) => setScores(data),
    'score:update': (data) => {
      setLiveUpdate(data);
      toast(`🎯 ${data.teamName} solved ${data.challenge.title} (+${data.challenge.points}pts)`, {
        style: { background: 'var(--bg-card)', border: '1px solid var(--neon-cyan)', color: 'var(--neon-cyan)' },
      });
      setTimeout(() => setLiveUpdate(null), 4000);
    },
    connect: () => setConnected(true),
    disconnect: () => setConnected(false),
  });

  // Transform history for chart
  const chartData = (() => {
    if (!history.length) return [];
    const allTimes = [...new Set(history.flatMap((t) => t.points.map((p) => p.time)))].sort();
    return allTimes.slice(-20).map((time) => {
      const point = { time: new Date(time).toLocaleTimeString() };
      history.slice(0, 10).forEach((t) => {
        const latest = t.points.filter((p) => p.time <= time).slice(-1)[0];
        point[t.name] = latest?.score || 0;
      });
      return point;
    });
  })();

  const colors = ['var(--neon-green)', 'var(--neon-cyan)', 'var(--neon-pink)', 'var(--neon-orange)', 'var(--neon-purple)', 'var(--neon-yellow)', '#ff8844', '#44ffff', '#ff44aa', '#88ff44'];

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--neon-cyan)', letterSpacing: '0.2em', marginBottom: '0.5rem' }}>LIVE RANKINGS</div>
          <GlitchText text="SCOREBOARD" tag="h1" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', color: 'var(--text-primary)' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
          {connected ? <Wifi size={14} color="var(--neon-green)" /> : <WifiOff size={14} color="var(--neon-pink)" />}
          <span style={{ color: connected ? 'var(--neon-green)' : 'var(--neon-pink)' }}>
            {connected ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>
      </div>

      {/* Live update banner */}
      {liveUpdate && (
        <div style={{
          background: 'rgba(0, 212, 255, 0.1)', border: '1px solid var(--neon-cyan)',
          padding: '0.75rem 1.25rem', marginBottom: '1.5rem',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--neon-cyan)',
          animation: 'pulse-glow 1s ease-in-out 3',
        }}>
          🎯 <strong>{liveUpdate.teamName}</strong> just solved <strong>{liveUpdate.challenge?.title}</strong>!
          <span style={{ marginLeft: 'auto', color: 'var(--neon-green)' }}>+{liveUpdate.challenge?.points} pts</span>
        </div>
      )}

      {/* Tab switch */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
        {['table', 'chart'].map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: tab === t ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
            border: `1px solid ${tab === t ? 'var(--neon-cyan)' : 'var(--border)'}`,
            color: tab === t ? 'var(--neon-cyan)' : 'var(--text-dim)',
            padding: '0.4rem 1rem', fontFamily: 'var(--font-display)', fontSize: '0.7rem',
            cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
            {t === 'table' ? '⊞ Rankings' : '📈 Score Chart'}
          </button>
        ))}
      </div>

      {tab === 'table' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          {/* Table header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '60px 1fr 80px 80px 100px',
            padding: '0.75rem 1.5rem',
            borderBottom: '2px solid var(--border)',
            fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
            color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em',
          }}>
            <div>Rank</div>
            <div>Team</div>
            <div style={{ textAlign: 'center' }}>Solves</div>
            <div style={{ textAlign: 'center' }}>Last Solve</div>
            <div style={{ textAlign: 'right' }}>Score</div>
          </div>

          {scores.map((s, i) => {
            const isMe = s.id === team?.id;
            const medalColor = i < 3 ? RANK_COLORS[i] : null;

            return (
              <div key={s.id} style={{
                display: 'grid',
                gridTemplateColumns: '60px 1fr 80px 80px 100px',
                padding: '1rem 1.5rem', alignItems: 'center',
                borderBottom: '1px solid var(--border)',
                background: isMe ? 'rgba(0, 255, 136, 0.04)' : i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                borderLeft: isMe ? '3px solid var(--neon-green)' : '3px solid transparent',
                transition: 'background 0.2s',
              }}>
                {/* Rank */}
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: '1rem',
                  color: medalColor || 'var(--text-dim)',
                  textShadow: medalColor ? `0 0 10px ${medalColor}88` : 'none',
                }}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${s.rank}`}
                </div>

                {/* Team */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {/* Avatar */}
                  <div style={{
                    width: 32, height: 32,
                    background: `hsl(${parseInt(s.avatarSeed, 36) % 360}, 60%, 30%)`,
                    border: `1px solid hsl(${parseInt(s.avatarSeed, 36) % 360}, 60%, 50%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-display)', fontSize: '0.7rem',
                    color: `hsl(${parseInt(s.avatarSeed, 36) % 360}, 80%, 80%)`,
                    flexShrink: 0,
                  }}>
                    {s.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, color: isMe ? 'var(--neon-green)' : 'var(--text-primary)', fontSize: '0.95rem' }}>
                      {s.name} {isMe && <span style={{ fontSize: '0.65rem', color: 'var(--neon-green)', fontFamily: 'var(--font-mono)' }}>(you)</span>}
                    </div>
                    {s.country && <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{FLAG_EMOJIS[s.country] || '🌍'} {s.country}</div>}
                  </div>
                </div>

                {/* Solves */}
                <div style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)', fontSize: '0.85rem' }}>
                  {s.solveCount}
                </div>

                {/* Last solve */}
                <div style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', fontSize: '0.7rem' }}>
                  {s.lastSolve ? formatDistanceToNow(new Date(s.lastSolve), { addSuffix: true }) : '—'}
                </div>

                {/* Score */}
                <div style={{
                  textAlign: 'right', fontFamily: 'var(--font-display)',
                  fontSize: '1.1rem',
                  color: isMe ? 'var(--neon-green)' : medalColor || 'var(--text-primary)',
                  textShadow: (isMe || medalColor) ? `0 0 10px ${isMe ? 'var(--neon-green)' : medalColor}88` : 'none',
                }}>
                  {s.score.toLocaleString()}
                </div>
              </div>
            );
          })}

          {scores.length === 0 && (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
              <Trophy size={32} style={{ marginBottom: '0.75rem', opacity: 0.3 }} />
              <p>No teams on the scoreboard yet. Be the first!</p>
            </div>
          )}
        </div>
      )}

      {tab === 'chart' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '2rem' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', color: 'var(--neon-cyan)', marginBottom: '1.5rem', letterSpacing: '0.1em' }}>
            SCORE PROGRESSION (TOP 10)
          </h3>
          {chartData.length > 1 ? (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData}>
                <XAxis dataKey="time" stroke="var(--text-dim)" tick={{ fontFamily: 'var(--font-mono)', fontSize: 11 }} />
                <YAxis stroke="var(--text-dim)" tick={{ fontFamily: 'var(--font-mono)', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}
                  labelStyle={{ color: 'var(--neon-cyan)' }}
                />
                {history.slice(0, 10).map((t, i) => (
                  <Line key={t.name} type="monotone" dataKey={t.name} stroke={colors[i]} dot={false} strokeWidth={2} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
              Not enough data yet. Chart will appear once teams start solving challenges.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
