import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GlitchText from '../components/GlitchText';
import Terminal from '../components/Terminal';
import { Shield, Target, Eye, Database, Zap, Users, ChevronRight } from 'lucide-react';

const TERMINAL_LINES = [
  { text: '> Initializing GlitchCraft Investigation Framework...', color: 'dim', pause: 300 },
  { text: '> Loading case files: [REDACTED]', color: 'cyan', pause: 200 },
  { text: '> 11 challenges across 6 categories detected.', color: 'white', pause: 150 },
  { text: '> Challenge types: Web ■ Stego ■ Metadata ■ Crypto ■ OSINT ■ Forensics', color: 'white', pause: 200 },
  { text: '> WARNING: This investigation involves classified cybercrime evidence.', color: 'orange', pause: 300 },
  { text: '> All participants must register to access case files.', color: 'dim', pause: 200 },
  { text: '> Good luck, investigator. The truth is buried deep.', color: 'green', pause: 0 },
];

const FEATURE_CARDS = [
  { icon: '🌐', label: 'Web Forensics', desc: 'Audit public-facing assets. Find inconsistencies hidden in source, cookies, and headers.', color: 'var(--neon-green)' },
  { icon: '🖼️', label: 'Steganography', desc: 'Analyze images, audio, and video for hidden steganographic payloads and LSB encoding.', color: 'var(--neon-pink)' },
  { icon: '📋', label: 'Metadata Analysis', desc: 'Extract EXIF data, document properties, and embedded timestamps from files.', color: 'var(--neon-cyan)' },
  { icon: '🔐', label: 'Cryptography', desc: 'Decrypt intercepted messages, break ciphers, and trace encoded communications.', color: 'var(--neon-orange)' },
  { icon: '🔍', label: 'OSINT', desc: 'Use open-source intelligence to trace digital identities and uncover hidden connections.', color: 'var(--neon-purple)' },
  { icon: '🧪', label: 'Digital Forensics', desc: 'Analyze memory dumps, PCAP files, and file system artifacts for hidden evidence.', color: 'var(--neon-yellow)' },
];

export default function Landing() {
  const { team } = useAuth();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 100);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Hero Section */}
      <section style={{
        position: 'relative', minHeight: '100vh',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        textAlign: 'center', padding: '4rem 2rem', overflow: 'hidden',
      }}>
        {/* Animated background rings */}
        {[300, 500, 700, 900].map((size, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: size, height: size,
            borderRadius: '50%',
            border: `1px solid rgba(0, 212, 255, ${0.06 - i * 0.01})`,
            animation: `spin-slow ${20 + i * 5}s linear infinite ${i % 2 === 0 ? '' : 'reverse'}`,
            left: '50%', top: '40%',
            transform: 'translate(-50%, -50%)',
          }} />
        ))}

        {/* Glowing orb */}
        <div style={{
          position: 'absolute',
          width: 200, height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 212, 255, 0.15) 0%, transparent 70%)',
          left: '50%', top: '40%',
          transform: 'translate(-50%, -50%)',
          animation: 'float 4s ease-in-out infinite',
        }} />

        {/* Event tag */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          border: '1px solid rgba(255, 0, 102, 0.4)',
          background: 'rgba(255, 0, 102, 0.05)',
          padding: '0.4rem 1rem', marginBottom: '2rem',
          fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--neon-pink)',
          letterSpacing: '0.15em', textTransform: 'uppercase',
        }}>
          <Zap size={12} />
          Cybercrime Investigation CTF 2024
        </div>

        {/* Title */}
        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(3.5rem, 12vw, 8rem)',
            fontWeight: 900,
            letterSpacing: '0.05em',
            lineHeight: 1,
            color: 'var(--neon-green)',
            textShadow: `0 0 30px rgba(0, 255, 136, 0.6), 0 0 80px rgba(0, 255, 136, 0.2)`,
          }}>
            GLITCH
          </h1>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(3.5rem, 12vw, 8rem)',
            fontWeight: 900,
            letterSpacing: '0.05em',
            lineHeight: 1,
            color: 'var(--neon-cyan)',
            textShadow: `0 0 30px rgba(0, 212, 255, 0.6), 0 0 80px rgba(0, 212, 255, 0.2)`,
          }}>
            CRAFT
          </h1>

          {/* Glitch overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(3.5rem, 12vw, 8rem)',
            fontWeight: 900,
            color: 'var(--neon-pink)',
            opacity: 0.08,
            animation: 'glitch 4s infinite',
            pointerEvents: 'none',
            lineHeight: 1,
          }}>
            GLITCH<br />CRAFT
          </div>
        </div>

        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
          color: 'var(--text-secondary)', maxWidth: '600px',
          marginBottom: '3rem', lineHeight: 1.7, fontWeight: 300,
        }}>
          Navigate a complex cybercrime investigation through digital forensics, 
          steganography, metadata analysis, and OSINT. Reconstruct the evidence trail. 
          <span style={{ color: 'var(--neon-cyan)' }}> Uncover the truth.</span>
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '4rem' }}>
          {team ? (
            <Link to="/challenges" className="btn btn-solid-green" style={{ fontSize: '0.85rem', padding: '0.8rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Target size={16} />
              Enter Investigation
              <ChevronRight size={14} />
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-solid-green" style={{ fontSize: '0.85rem', padding: '0.8rem 2rem' }}>
                Join the Investigation
              </Link>
              <Link to="/login" className="btn btn-cyan" style={{ fontSize: '0.85rem', padding: '0.8rem 2rem' }}>
                Sign In
              </Link>
            </>
          )}
          <Link to="/scoreboard" className="btn btn-pink" style={{ fontSize: '0.85rem', padding: '0.8rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={16} />
            Live Scoreboard
          </Link>
        </div>

        {/* Terminal */}
        <div style={{ width: '100%', maxWidth: '700px' }}>
          <Terminal lines={TERMINAL_LINES} speed={35} />
        </div>
      </section>

      {/* Categories Section */}
      <section style={{ padding: '5rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
            color: 'var(--neon-cyan)', letterSpacing: '0.2em',
            textTransform: 'uppercase', marginBottom: '0.75rem',
          }}>
            Investigation Domains
          </div>
          <GlitchText
            text="CASE FILE CATEGORIES"
            tag="h2"
            style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
              color: 'var(--text-primary)', letterSpacing: '0.1em',
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {FEATURE_CARDS.map((card, i) => (
            <div key={i} className="card" style={{
              padding: '1.75rem',
              transition: 'all 0.3s',
              borderLeft: `3px solid ${card.color}`,
              animationDelay: `${i * 0.1}s`,
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{card.icon}</div>
              <h3 style={{
                fontFamily: 'var(--font-display)', fontSize: '0.9rem',
                color: card.color, marginBottom: '0.5rem', letterSpacing: '0.1em',
              }}>
                {card.label}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '2rem', textAlign: 'center',
        fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-dim)',
      }}>
        <span style={{ color: 'var(--neon-cyan)' }}>GlitchCraft CTF</span> — A Cybercrime Investigation Event
        <br />
        <span style={{ marginTop: '0.5rem', display: 'block' }}>
          Built with <span style={{ color: 'var(--neon-pink)' }}>♥</span> for security enthusiasts
        </span>
      </footer>
    </div>
  );
}
