"use client";
import React from 'react';

// Product button. Primary uses the active workflow accent (--accent, set by the app shell).
// variants: primary | secondary (alias: outline) | ghost | danger. sizes: sm | md | lg.
const NeonButton = ({
  children, onClick, variant = 'primary', size = 'md', style, type = 'button', disabled, className = '', ...rest
}) => {
  const kind = variant === 'outline' ? 'secondary' : variant;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`bv-btn bv-btn--${kind} bv-btn--${size} ${className}`.trim()}
      style={style}
      {...rest}
    >
      {children}
    </button>
  );
};

export { NeonButton, NeonButton as Button };
