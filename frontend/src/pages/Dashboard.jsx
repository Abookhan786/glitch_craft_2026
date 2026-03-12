import { useState, useEffect } from 'react';
import { challengeAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ChallengeCard from '../components/ChallengeCard';
import GlitchText from '../components/GlitchText';
import { Search, Filter, CheckCircle, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const DIFFICULTIES = ['ALL', 'EASY', 'MEDIUM', 'HARD', 'INSANE'];

export default function Dashboard() {
  const { team } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('ALL');
  const [filterDiff, setFilterDiff] = useState('ALL');
  const [filterSolved, setFilterSolved] = useState('ALL'); // ALL | SOLVED | UNSOLVED

  useEffect(() => {
    Promise.all([challengeAPI.getAll(), challengeAPI.getCategories()])
      .then(([ch, cat]) => {
        setChallenges(ch.data);
        setCategories([{ slug: 'ALL', name: 'All Categories', icon: '🗂️' }, ...cat.data]);
      })
      .catch(() => toast.error('Failed to load challenges'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = challenges.filter((c) => {
    if (filterCat !== 'ALL' && c.category?.slug !== filterCat) return false;
    if (filterDiff !== 'ALL' && c.difficulty !== filterDiff) return false;
    if (filterSolved === 'SOLVED' && !c.isSolved) return false;
    if (filterSolved === 'UNSOLVED' && c.isSolved) return false;
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.description?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Group by category
  const grouped = filtered.reduce((acc, c) => {
    const key = c.category?.name || 'Uncategorized';
    if (!acc[key]) acc[key] = { icon: c.category?.icon, color: c.category?.color, challenges: [] };
    acc[key].challenges.push(c);
    return acc;
  }, {});

  const solvedCount = challenges.filter((c) => c.isSolved).length;

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70vh', gap: '1rem' }}>
        <div className="spinner" />
        <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', fontSize: '0.85rem' }}>Loading case files...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--neon-cyan)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Investigation Files
          </div>
          <GlitchText text="CASE CHALLENGES" tag="h1" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', color: 'var(--text-primary)' }} />
        </div>
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          padding: '0.75rem 1.25rem', display: 'flex', gap: '1.5rem',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--neon-green)' }}>{solvedCount}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)' }}>SOLVED</div>
          </div>
          <div style={{ width: '1px', background: 'var(--border)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--neon-cyan)' }}>{challenges.length - solvedCount}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)' }}>REMAINING</div>
          </div>
          <div style={{ width: '1px', background: 'var(--border)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--neon-orange)' }}>{team?.score?.toLocaleString()}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)' }}>POINTS</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 250px', maxWidth: '350px' }}>
          <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input
            className="input"
            placeholder="Search challenges..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.25rem', fontSize: '0.85rem' }}
          />
        </div>

        {/* Category filter */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setFilterCat(cat.slug)}
              style={{
                background: filterCat === cat.slug ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
                border: `1px solid ${filterCat === cat.slug ? 'var(--neon-cyan)' : 'var(--border)'}`,
                color: filterCat === cat.slug ? 'var(--neon-cyan)' : 'var(--text-dim)',
                padding: '0.3rem 0.7rem',
                fontFamily: 'var(--font-mono)', fontSize: '0.7rem', cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {cat.icon} {cat.name || cat.slug}
            </button>
          ))}
        </div>

        {/* Difficulty */}
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              onClick={() => setFilterDiff(d)}
              style={{
                background: filterDiff === d ? 'rgba(255, 0, 102, 0.1)' : 'transparent',
                border: `1px solid ${filterDiff === d ? 'var(--neon-pink)' : 'var(--border)'}`,
                color: filterDiff === d ? 'var(--neon-pink)' : 'var(--text-dim)',
                padding: '0.3rem 0.7rem',
                fontFamily: 'var(--font-mono)', fontSize: '0.7rem', cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Solved filter */}
        <button
          onClick={() => setFilterSolved(filterSolved === 'UNSOLVED' ? 'ALL' : 'UNSOLVED')}
          style={{
            background: filterSolved === 'UNSOLVED' ? 'rgba(0, 255, 136, 0.1)' : 'transparent',
            border: `1px solid ${filterSolved === 'UNSOLVED' ? 'var(--neon-green)' : 'var(--border)'}`,
            color: filterSolved === 'UNSOLVED' ? 'var(--neon-green)' : 'var(--text-dim)',
            padding: '0.3rem 0.7rem',
            fontFamily: 'var(--font-mono)', fontSize: '0.7rem', cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <Lock size={10} style={{ marginRight: '0.3rem' }} />
          Unsolved Only
        </button>
      </div>

      {/* Challenges Grid by Category */}
      {Object.entries(grouped).map(([catName, group]) => (
        <div key={catName} style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: '1.25rem' }}>{group.icon}</span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: group.color || 'var(--neon-cyan)', letterSpacing: '0.1em' }}>
              {catName.toUpperCase()}
            </h2>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-dim)', marginLeft: '0.25rem' }}>
              ({group.challenges.length} challenges)
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {group.challenges.map((c) => (
              <ChallengeCard key={c.id} challenge={c} />
            ))}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
          <p>No challenges match your filters.</p>
        </div>
      )}
    </div>
  );
}
