import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Lock, Users, FileText, Lightbulb, ExternalLink } from 'lucide-react';

const difficultyConfig = {
  EASY: { label: 'Easy', class: 'badge-easy', color: 'var(--neon-green)' },
  MEDIUM: { label: 'Medium', class: 'badge-medium', color: 'var(--neon-yellow)' },
  HARD: { label: 'Hard', class: 'badge-hard', color: 'var(--neon-orange)' },
  INSANE: { label: 'Insane', class: 'badge-insane', color: 'var(--neon-pink)' },
};

export default function ChallengeCard({ challenge }) {
  const [hovered, setHovered] = useState(false);
  const diff = difficultyConfig[challenge.difficulty] || difficultyConfig.EASY;

  return (
    <Link
      to={`/challenges/${challenge.id}`}
      style={{ textDecoration: 'none', display: 'block' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        background: challenge.isSolved ? 'rgba(0, 255, 136, 0.04)' : 'var(--bg-card)',
        border: `1px solid ${hovered ? diff.color : challenge.isSolved ? 'rgba(0,255,136,0.25)' : 'var(--border)'}`,
        padding: '1.25rem',
        transition: 'all 0.2s',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: hovered ? `0 0 20px ${diff.color}22` : 'none',
      }}>
        {/* Corner accent */}
        <div style={{
          position: 'absolute', top: 0, right: 0,
          width: 0, height: 0,
          borderStyle: 'solid',
          borderWidth: `0 30px 30px 0`,
          borderColor: `transparent ${hovered ? diff.color : 'var(--border)'} transparent transparent`,
          opacity: 0.6,
          transition: 'all 0.2s',
        }} />

        {/* Solved badge */}
        {challenge.isSolved && (
          <div style={{
            position: 'absolute', top: '0.6rem', left: '0.6rem',
            display: 'flex', alignItems: 'center', gap: '0.3rem',
            background: 'rgba(0, 255, 136, 0.1)',
            border: '1px solid rgba(0, 255, 136, 0.3)',
            padding: '0.15rem 0.5rem',
            fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
            color: 'var(--neon-green)',
          }}>
            <CheckCircle size={10} />
            SOLVED
          </div>
        )}

        <div style={{ marginTop: challenge.isSolved ? '1.5rem' : 0 }}>
          {/* Category & Difficulty */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem' }}>{challenge.category?.icon}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              {challenge.category?.name}
            </span>
            <span className={`badge ${diff.class}`} style={{ marginLeft: 'auto' }}>
              {diff.label}
            </span>
          </div>

          {/* Title */}
          <h3 style={{
            fontFamily: 'var(--font-display)', fontSize: '0.95rem',
            color: hovered ? diff.color : 'var(--text-primary)',
            marginBottom: '0.5rem', letterSpacing: '0.05em',
            transition: 'color 0.2s',
            textShadow: hovered ? `0 0 10px ${diff.color}88` : 'none',
          }}>
            {challenge.title}
          </h3>

          {/* Description preview */}
          <p style={{
            color: 'var(--text-secondary)', fontSize: '0.8rem',
            lineHeight: 1.5, marginBottom: '1rem',
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {challenge.description?.replace(/\*\*.*?\*\*/g, '').replace(/`.*?`/g, '').slice(0, 100)}...
          </p>

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: '1.1rem',
              color: diff.color, fontWeight: 700,
              textShadow: `0 0 10px ${diff.color}66`,
            }}>
              {challenge.points}
              <span style={{ fontSize: '0.6rem', marginLeft: '0.2rem', opacity: 0.7 }}>PTS</span>
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
              <Users size={12} />
              {challenge.solveCount}
            </div>
            {challenge.files?.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                <FileText size={12} />
                {challenge.files.length}
              </div>
            )}
            {challenge.hints?.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                <Lightbulb size={12} />
                {challenge.hints.length}
              </div>
            )}
            <ExternalLink size={12} color={hovered ? diff.color : 'var(--text-dim)'} style={{ marginLeft: 'auto', transition: 'color 0.2s' }} />
          </div>
        </div>
      </div>
    </Link>
  );
}
