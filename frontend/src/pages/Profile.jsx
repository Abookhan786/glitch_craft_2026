import { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, User, Trophy, Target } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const diffColors = { EASY: 'var(--neon-green)', MEDIUM: 'var(--neon-yellow)', HARD: 'var(--neon-orange)', INSANE: 'var(--neon-pink)' };

export default function Profile() {
  const { team } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authAPI.getProfile().then((r) => setProfile(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}><div className="spinner" /></div>;
  if (!profile) return null;

  const avatarColor = `hsl(${parseInt(profile.avatarSeed || '00', 36) % 360}, 60%, 40%)`;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Profile Header */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        padding: '2rem', marginBottom: '2rem',
        display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap',
      }}>
        <div style={{
          width: 80, height: 80, background: avatarColor,
          border: `2px solid ${avatarColor.replace('40%', '70%')}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontSize: '1.5rem',
          color: avatarColor.replace('40%', '90%'), flexShrink: 0,
        }}>
          {profile.name.slice(0, 2).toUpperCase()}
        </div>

        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--neon-green)', marginBottom: '0.25rem' }}>
            {profile.name}
          </h1>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            {profile.email} {profile.country && `· ${profile.country}`}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Joined {formatDistanceToNow(new Date(profile.createdAt), { addSuffix: true })}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '2rem' }}>
          {[
            { label: 'Score', value: profile.score?.toLocaleString(), color: 'var(--neon-green)', icon: <Trophy size={16} /> },
            { label: 'Solved', value: profile.submissions?.length || 0, color: 'var(--neon-cyan)', icon: <Target size={16} /> },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', color: stat.color, marginBottom: '0.25rem' }}>
                {stat.icon}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: stat.color }}>{stat.value}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Solved Challenges */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '1.5rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--neon-cyan)', marginBottom: '1.25rem', letterSpacing: '0.1em' }}>
          <CheckCircle size={14} style={{ marginRight: '0.4rem' }} />
          SOLVED CHALLENGES
        </h2>

        {!profile.submissions?.length ? (
          <p style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
            No challenges solved yet. Start the investigation!
          </p>
        ) : (
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {profile.submissions.map((sub) => (
              <div key={sub.challenge?.id} style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                background: 'var(--bg-panel)', border: '1px solid var(--border)',
                padding: '0.75rem 1rem',
              }}>
                <CheckCircle size={14} color="var(--neon-green)" flexShrink={0} />
                <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontWeight: 500, color: 'var(--text-primary)' }}>
                  {sub.challenge?.title}
                </span>
                <span className={`badge badge-${sub.challenge?.difficulty?.toLowerCase()}`}>
                  {sub.challenge?.difficulty}
                </span>
                <span style={{ fontFamily: 'var(--font-display)', color: diffColors[sub.challenge?.difficulty] || 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  +{sub.challenge?.points}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
