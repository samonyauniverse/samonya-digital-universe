
import React, { useEffect, useState } from 'react';

interface Props {
  onComplete?: () => void;
  className?: string;
}

const IntroLogo: React.FC<Props> = ({ onComplete, className = "" }) => {
  const [phase, setPhase] = useState(0);

  // Animation Sequence Controller (5 Seconds Total)
  useEffect(() => {
    // Phase 0: Init (0s)
    
    // Phase 1: Start Drawing Strokes (Box & S) (0.5s)
    const t1 = setTimeout(() => setPhase(1), 500);

    // Phase 2: Fill Cosmic Void & Stars (2.0s)
    const t2 = setTimeout(() => setPhase(2), 2000);

    // Phase 3: Text Fade In & Final Hold (3.0s - 5.0s)
    const t3 = setTimeout(() => setPhase(3), 3000);

    // Phase 4: Complete (5.0s)
    const t4 = setTimeout(() => {
        if (onComplete) onComplete();
    }, 5000);

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <div className={`relative w-full h-full flex flex-col items-center justify-center bg-[#020617] overflow-hidden ${className}`}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@800;900&display=swap');

          /* Stroke Drawing Animation */
          .draw-path {
             stroke-dasharray: 400;
             stroke-dashoffset: 400;
             transition: stroke-dashoffset 1.5s ease-in-out;
          }
          
          .draw-active {
             stroke-dashoffset: 0;
          }

          /* Opacity Transitions */
          .fade-element {
             opacity: 0;
             transition: opacity 1s ease-out;
          }
          .fade-in {
             opacity: 1;
          }

          /* Star Twinkle */
          .twinkle {
             animation: twinkle 3s infinite ease-in-out;
          }
          @keyframes twinkle {
             0%, 100% { opacity: 0.8; transform: scale(1); }
             50% { opacity: 0.3; transform: scale(0.8); }
          }

          /* Text Reveal */
          .text-reveal {
             clip-path: polygon(0 0, 0 0, 0 100%, 0% 100%);
             transition: clip-path 1s cubic-bezier(0.77, 0, 0.175, 1);
          }
          .text-visible {
             clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
          }
        `}
      </style>

      {/* Container for Logo to ensure it scales but stays centered */}
      <div className="relative transform scale-150 md:scale-[2]">
          <svg width="200" height="200" viewBox="0 0 100 100" className="overflow-visible">
            <defs>
                {/* 1. Rainbow Gradient for Border */}
                <linearGradient id="introBrandRainbow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22d3ee" />   {/* Cyan */}
                    <stop offset="20%" stopColor="#a855f7" />   {/* Purple */}
                    <stop offset="40%" stopColor="#ec4899" />   {/* Pink */}
                    <stop offset="60%" stopColor="#ef4444" />   {/* Red */}
                    <stop offset="80%" stopColor="#f59e0b" />   {/* Amber */}
                    <stop offset="100%" stopColor="#22c55e" />  {/* Green */}
                </linearGradient>
                
                {/* 2. Cosmic Void Background */}
                <radialGradient id="introCosmicVoid" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="0%" stopColor="#1e1b4b" /> {/* Dark Indigo */}
                    <stop offset="100%" stopColor="#000000" /> {/* Black */}
                </radialGradient>

                {/* 3. Neon Glow Filter */}
                <filter id="introNeonGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>

            {/* --- The Box (Background Fill) --- */}
            {/* Fades in at Phase 2 */}
            <rect 
                x="10" y="10" width="80" height="80" rx="22" 
                fill="url(#introCosmicVoid)" 
                className={`fade-element ${phase >= 2 ? 'fade-in' : ''}`}
            />

            {/* --- The Box (Border Stroke) --- */}
            {/* Draws at Phase 1 */}
            <rect 
                x="10" y="10" width="80" height="80" rx="22" 
                fill="none" 
                stroke="url(#introBrandRainbow)" 
                strokeWidth="5" 
                className={`draw-path ${phase >= 1 ? 'draw-active' : ''}`}
            />
            
            {/* --- Digital Stars --- */}
            {/* Pop in at Phase 2 */}
            <g className={`fade-element ${phase >= 2 ? 'fade-in' : ''}`}>
                <circle cx="25" cy="25" r="1.5" fill="white" className="twinkle" style={{ animationDelay: '0s' }} />
                <circle cx="75" cy="80" r="1" fill="#22d3ee" className="twinkle" style={{ animationDelay: '1s' }} />
                <circle cx="80" cy="30" r="1.5" fill="#ec4899" className="twinkle" style={{ animationDelay: '0.5s' }} />
                <circle cx="20" cy="70" r="1" fill="white" opacity="0.5" />
            </g>

            {/* --- The 'S' (Filament) --- */}
            {/* Draws at Phase 1 */}
            <path 
                d="M 65 35 C 35 35 35 50 50 50 C 65 50 65 65 35 65" 
                stroke="white" 
                strokeWidth="6" 
                strokeLinecap="round" 
                fill="none" 
                filter="url(#introNeonGlow)"
                className={`draw-path ${phase >= 1 ? 'draw-active' : ''}`}
                style={{ transitionDelay: '0.3s' }} // Slight delay after box starts
            />
          </svg>
      </div>

      {/* --- Text Reveal (Phase 3) --- */}
      <div className="mt-12 text-center">
          <div className={`text-reveal ${phase >= 3 ? 'text-visible' : ''}`}>
              <h1 className="text-3xl md:text-4xl font-black tracking-tighter leading-none text-transparent bg-clip-text bg-[linear-gradient(to_right,#22d3ee,#a855f7,#ec4899,#ef4444,#f59e0b,#22c55e)] drop-shadow-lg mb-2">
                SAMONYA
              </h1>
          </div>
          <div className={`text-reveal ${phase >= 3 ? 'text-visible' : ''}`} style={{ transitionDelay: '0.2s' }}>
              <h2 className="text-xs md:text-sm font-bold tracking-[0.4em] uppercase text-cyan-100/80 drop-shadow-md">
                DIGITAL UNIVERSE
              </h2>
          </div>
      </div>

    </div>
  );
};

export default IntroLogo;
