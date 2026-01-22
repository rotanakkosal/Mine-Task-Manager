
import React from 'react';

export const Snowfall: React.FC = () => {
  const snowflakes = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 5}s`,
    duration: `${8 + Math.random() * 5}s`,
    size: `${0.5 + Math.random() * 1}em`,
    opacity: 0.3 + Math.random() * 0.5
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]" aria-hidden="true">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="snowflake"
          style={{
            left: flake.left,
            animationDelay: `${flake.delay}, ${flake.delay}`,
            animationDuration: `${flake.duration}, 3s`,
            fontSize: flake.size,
            opacity: flake.opacity
          }}
        >
          ❅
        </div>
      ))}
    </div>
  );
};
