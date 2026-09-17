'use client';

import React from 'react';

export function BackgroundWaves() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Enterprise Cyber-Defense Mesh Grid */}
      <div 
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 25%, black 40%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 25%, black 40%, transparent 100%)',
        }}
      />

      {/* Subtle Emerald & Cyan Ambient Glows */}
      <div className="absolute top-[18%] left-1/2 -translate-x-1/2 w-[850px] h-[400px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[35%] left-[10%] w-[500px] h-[300px] bg-cyan-500/8 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-[50%] right-[10%] w-[550px] h-[350px] bg-emerald-600/8 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 w-[700px] h-[250px] bg-emerald-500/6 rounded-full blur-[130px] pointer-events-none" />
    </div>
  );
}
