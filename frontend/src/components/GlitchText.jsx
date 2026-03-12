import { useEffect, useRef } from 'react';

const CHARS = '!<>-_\\/[]{}—=+*^?#@$%&ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export default function GlitchText({ text, className = '', style = {}, tag: Tag = 'span', speed = 40 }) {
  const ref = useRef(null);
  const intervalRef = useRef(null);
  const frameRef = useRef(0);

  const scramble = (target, original) => {
    let iteration = 0;
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (!ref.current) return;
      ref.current.innerText = original
        .split('')
        .map((letter, i) => {
          if (i < iteration) return original[i];
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        })
        .join('');
      if (iteration >= original.length) clearInterval(intervalRef.current);
      iteration += 1 / 3;
    }, speed);
  };

  useEffect(() => {
    if (ref.current) ref.current.innerText = text;
    return () => clearInterval(intervalRef.current);
  }, [text]);

  return (
    <Tag
      ref={ref}
      className={className}
      style={style}
      onMouseEnter={() => scramble(ref.current, text)}
    >
      {text}
    </Tag>
  );
}
