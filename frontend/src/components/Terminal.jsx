import { useState, useEffect } from 'react';

export default function Terminal({ lines = [], autoPlay = true, speed = 40, style = {} }) {
  const [displayed, setDisplayed] = useState([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const blink = setInterval(() => setShowCursor((v) => !v), 500);
    return () => clearInterval(blink);
  }, []);

  useEffect(() => {
    if (!autoPlay || currentLine >= lines.length) return;
    const line = lines[currentLine];
    if (currentChar < line.text.length) {
      const t = setTimeout(() => {
        setDisplayed((prev) => {
          const copy = [...prev];
          if (!copy[currentLine]) copy[currentLine] = { ...line, text: '' };
          copy[currentLine] = { ...line, text: line.text.slice(0, currentChar + 1) };
          return copy;
        });
        setCurrentChar((c) => c + 1);
      }, speed);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        setCurrentLine((l) => l + 1);
        setCurrentChar(0);
      }, line.pause || 200);
      return () => clearTimeout(t);
    }
  }, [currentLine, currentChar, lines, autoPlay, speed]);

  const colorMap = {
    green: 'var(--neon-green)',
    cyan: 'var(--neon-cyan)',
    pink: 'var(--neon-pink)',
    orange: 'var(--neon-orange)',
    dim: 'var(--text-secondary)',
    white: 'var(--text-primary)',
  };

  return (
    <div style={{
      background: 'var(--bg-panel)',
      border: '1px solid var(--border-bright)',
      padding: '1.5rem',
      fontFamily: 'var(--font-mono)',
      fontSize: '0.85rem',
      lineHeight: 1.8,
      ...style,
    }}>
      {/* Terminal header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
        {['var(--neon-pink)', 'var(--neon-yellow)', 'var(--neon-green)'].map((c, i) => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
        ))}
        <span style={{ marginLeft: '0.5rem', color: 'var(--text-dim)', fontSize: '0.75rem' }}>glitchcraft@ctf:~$</span>
      </div>

      {/* Lines */}
      {displayed.map((line, i) => (
        <div key={i} style={{ color: colorMap[line.color] || colorMap.white }}>
          {line.prefix && <span style={{ color: 'var(--neon-green)' }}>{line.prefix} </span>}
          {line.text}
          {i === displayed.length - 1 && showCursor && <span style={{ color: 'var(--neon-green)' }}>█</span>}
        </div>
      ))}

      {/* Cursor when idle */}
      {displayed.length === 0 && (
        <span style={{ color: 'var(--neon-green)' }}>{showCursor ? '█' : ' '}</span>
      )}
    </div>
  );
}
