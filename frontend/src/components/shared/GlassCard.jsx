"use client";
import React from 'react';

// Flat surface: solid fill, 1px border, no blur or shadow. Name kept so existing imports keep working.
const GlassCard = ({ children, style, onClick, hover = false, hoverEffect = false, className = '', ...rest }) => {
  const interactive = hover || hoverEffect || Boolean(onClick);
  const keyboardProps = onClick
    ? {
        role: 'button',
        tabIndex: 0,
        onKeyDown: (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick(e);
          }
        },
      }
    : {};

  return (
    <div
      onClick={onClick}
      className={`bv-surface${interactive ? ' bv-surface--interactive' : ''} ${className}`.trim()}
      style={style}
      {...keyboardProps}
      {...rest}
    >
      {children}
    </div>
  );
};

export { GlassCard, GlassCard as Surface };
