import { useEffect, useState } from 'react';

type AnimatedHeadingProps = {
  text: string;
  className?: string;
};

export function AnimatedHeading({ text, className = '' }: AnimatedHeadingProps) {
  return (
    <span aria-label={text} className={`yell-hero-fade ${className}`}>
      {text}
    </span>
  );
}

const HERO_TITLES = ['Three AI Personas. One Question.', 'Clash of the Tokens'] as const;

export function RotatingHeroHeading({ className = '' }: { className?: string }) {
  const [titleIndex, setTitleIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTitleIndex((current) => (current + 1) % HERO_TITLES.length);
    }, 2_000);

    return () => window.clearInterval(interval);
  }, []);

  const title = HERO_TITLES[titleIndex];

  return (
    <span aria-live="polite" className={className}>
      <AnimatedHeading key={title} text={title} />
    </span>
  );
}
