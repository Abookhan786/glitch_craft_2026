import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { challengeAPI, submissionAPI, hintAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle, Flag, Lightbulb, FileText, Download, Lock, AlertCircle } from 'lucide-react';

const diffConfig = {
  EASY: { color: 'var(--neon-green)', label: 'Easy' },
  MEDIUM: { color: 'var(--neon-yellow)', label: 'Medium' },
  HARD: { color: 'var(--neon-orange)', label: 'Hard' },
  INSANE: { color: 'var(--neon-pink)', label: 'Insane' },
};

// Render markdown-ish description
function MarkdownContent({ text }) {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`|\n)/g);
  return (
    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontFamily: 'var(--font-body)', fontSize: '0.95rem' }}>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} style={{ color: 'var(--neon-cyan)' }}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={i} style={{ fontFamily: 'var(--font-mono)', background: 'var(--bg-panel)', padding: '0.15rem 0.4rem', color: 'var(--neon-green)', fontSize: '0.85rem' }}>{part.slice(1, -1)}</code>;
        }
        if (part === '\n') return <br key={i} />;
        return part;
      })}
    </p>
  );
}

export default function Challenge() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { team, updateTeam } = useAuth();

  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [flag, setFlag] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [solved, setSolved] = useState(false);
  const [unlockingHint, setUnlockingHint] = useState(null);
  const [wrongFlash, setWrongFlash] = useState(false);

  useEffect(() => {
    challengeAPI.getById(id)
      .then((res) => {
        setChallenge(res.data);
        setSolved(res.data.isSolved);
      })
      .catch(() => { toast.error('Challenge not found'); navigate('/challenges'); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!flag.trim()) return;
    setSubmitting(true);
    try {
      const res = await submissionAPI.submit(id, flag.trim());
      if (res.data.correct) {
        setSolved(true);
        updateTeam({ score: res.data.newScore });
        toast.success(`🎉 ${res.data.message}`);
        setFlag('');
      } else {
        toast.error('Wrong flag. Keep investigating!', { icon: '❌' });
        setWrongFlash(true);
        setTimeout(() => setWrongFlash(false), 600);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnlockHint = async (hintId, cost) => {
    if (cost > 0 && !window.confirm(`Unlock this hint for ${cost} points?`)) return;
    setUnlockingHint(hintId);
    try {
      const res = await hintAPI.unlock(hintId);
      setChallenge((prev) => ({
        ...prev,
        hints: prev.hints.map((h) => h.id === hintId ? { ...h, content: res.data.content, unlocked: true } : h),
      }));
      if (cost > 0) {
        updateTeam({ score: team.score - cost });
        toast.success(`Hint unlocked! (-${cost} pts)`);
      } else {
        toast.success('Hint unlocked!');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to unlock hint');
    } finally {
      setUnlockingHint(null);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
      <div className="spinner" />
    </div>
  );

  if (!challenge) return null;

  const diff = diffConfig[challenge.difficulty] || diffConfig.EASY;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Back */}
      <button onClick={() => navigate('/challenges')} style={{
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
        marginBottom: '2rem', padding: 0,
      }}>
        <ArrowLeft size={14} /> Back to challenges
      </button>

      {/* Header */}
      <div style={{
        background: 'var(--bg-card)', border: `1px solid ${diff.color}44`,
        borderLeft: `4px solid ${diff.color}`,
        padding: '2rem', marginBottom: '2rem', position: 'relative',
        boxShadow: `0 0 30px ${diff.color}11`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '1.2rem' }}>{challenge.category?.icon}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                {challenge.category?.name}
              </span>
              <span className={`badge badge-${challenge.difficulty.toLowerCase()}`}>{diff.label}</span>
              {solved && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--neon-green)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
                  <CheckCircle size={12} /> SOLVED
                </span>
              )}
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.3rem, 4vw, 2rem)', color: diff.color, marginBottom: '0.25rem' }}>
              {challenge.title}
            </h1>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: diff.color, lineHeight: 1, textShadow: `0 0 20px ${diff.color}66` }}>
              {challenge.points}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)' }}>POINTS</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              {challenge.solveCount} solves
            </div>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
          <MarkdownContent text={challenge.description} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Main */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Files */}
          {challenge.files?.length > 0 && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '1.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', color: 'var(--neon-cyan)', marginBottom: '1rem', letterSpacing: '0.1em' }}>
                <FileText size={14} style={{ marginRight: '0.4rem' }} /> EVIDENCE FILES
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {challenge.files.map((file) => (
                  <a key={file.id} href={file.url} target="_blank" rel="noreferrer" style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    background: 'var(--bg-panel)', border: '1px solid var(--border)',
                    padding: '0.75rem 1rem', color: 'var(--text-primary)',
                    fontFamily: 'var(--font-mono)', fontSize: '0.8rem', textDecoration: 'none',
                    transition: 'border-color 0.2s',
                  }}>
                    <Download size={14} color="var(--neon-green)" />
                    {file.name}
                    <span style={{ marginLeft: 'auto', color: 'var(--text-dim)', fontSize: '0.7rem' }}>
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Flag Submission */}
          <div style={{
            background: solved ? 'rgba(0, 255, 136, 0.05)' : 'var(--bg-card)',
            border: `1px solid ${solved ? 'rgba(0, 255, 136, 0.4)' : wrongFlash ? 'var(--neon-pink)' : 'var(--border)'}`,
            padding: '1.5rem',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            boxShadow: wrongFlash ? '0 0 20px rgba(255, 0, 102, 0.2)' : solved ? '0 0 20px rgba(0, 255, 136, 0.1)' : 'none',
          }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', color: solved ? 'var(--neon-green)' : 'var(--neon-cyan)', marginBottom: '1rem', letterSpacing: '0.1em' }}>
              <Flag size={14} style={{ marginRight: '0.4rem' }} />
              {solved ? 'FLAG CAPTURED ✓' : 'SUBMIT FLAG'}
            </h3>

            {solved ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--neon-green)' }}>
                <CheckCircle size={24} />
                <span style={{ fontFamily: 'var(--font-mono)' }}>You solved this challenge!</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.75rem' }}>
                <input
                  className="input"
                  placeholder="GC{...}"
                  value={flag}
                  onChange={(e) => setFlag(e.target.value)}
                  style={{ flex: 1, fontFamily: 'var(--font-mono)' }}
                  autoComplete="off"
                />
                <button type="submit" disabled={submitting || !flag.trim()} className="btn btn-solid-green" style={{ whiteSpace: 'nowrap', opacity: submitting || !flag.trim() ? 0.6 : 1 }}>
                  {submitting ? '...' : 'SUBMIT'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Sidebar - Hints */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '1.25rem' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', color: 'var(--neon-orange)', marginBottom: '1rem', letterSpacing: '0.1em' }}>
            <Lightbulb size={14} style={{ marginRight: '0.4rem' }} />
            HINTS ({challenge.hints?.length || 0})
          </h3>

          {!challenge.hints?.length && (
            <p style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>No hints available.</p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {challenge.hints?.map((hint, i) => (
              <div key={hint.id} style={{
                background: hint.unlocked ? 'rgba(0, 255, 136, 0.05)' : 'var(--bg-panel)',
                border: `1px solid ${hint.unlocked ? 'rgba(0, 255, 136, 0.25)' : 'var(--border)'}`,
                padding: '0.75rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: hint.unlocked ? '0.5rem' : 0 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                    Hint #{i + 1}
                  </span>
                  {!hint.unlocked ? (
                    <button
                      onClick={() => handleUnlockHint(hint.id, hint.cost)}
                      disabled={unlockingHint === hint.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.3rem',
                        background: 'none', border: '1px solid var(--neon-orange)',
                        color: 'var(--neon-orange)', cursor: 'pointer',
                        fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                        padding: '0.25rem 0.6rem', transition: 'all 0.2s',
                      }}
                    >
                      <Lock size={10} />
                      {hint.cost > 0 ? `-${hint.cost} pts` : 'Free'}
                    </button>
                  ) : (
                    <CheckCircle size={12} color="var(--neon-green)" />
                  )}
                </div>

                {hint.unlocked && (
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                    {hint.content}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
