"use client";
import React, { useState, useEffect, useRef } from 'react';
import { C } from '../../constants/theme';

const MiniBar = ({ data, color = C.primary, height = 48 }) => {
  const max = Math.max(...data);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height }}>
      {data.map((v, i) => (
        <div key={i} style={{
          flex: 1, borderRadius: 3,
          height: `${(v / max) * 100}%`,
          background: `linear-gradient(to top, ${color}80, ${color})`,
          opacity: i === data.length - 1 ? 1 : 0.5,
          transition: 'height 0.8s ease',
        }} />
      ))}
    </div>
  );
};

export { MiniBar };
