
import React from 'react';

const DreamEyeLogo: React.FC<{ size?: number; className?: string }> = ({ size = 200, className = '' }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <style>
        {`
          @keyframes dream-pulse {
            0%, 100% { opacity: 0.8; transform: scale(1); filter: drop-shadow(0 0 10px rgba(217, 70, 239, 0.5)); }
            50% { opacity: 1; transform: scale(1.05); filter: drop-shadow(0 0 25px rgba(34, 211, 238, 0.8)); }
          }
          @keyframes iris-spin {
            0% { transform: rotate(0deg) scale(1); }
            50% { transform: rotate(180deg) scale(0.9); }
            100% { transform: rotate(360deg) scale(1); }
          }
          @keyframes blink {
             0%, 90%, 100% { transform: scaleY(1); }
             95% { transform: scaleY(0.1); }
          }
          .dream-container {
             animation: dream-pulse 4s infinite ease-in-out;
          }
          .iris-layer {
             transform-origin: center;
             animation: iris-spin 12s linear infinite;
          }
          .eye-lid {
             transform-origin: center;
             animation: blink 6s infinite;
          }
        `}
      </style>
      
      {/* Background Glow */}
      <div className="absolute inset-0 bg-fuchsia-500/20 rounded-full blur-3xl animate-pulse"></div>
      
      <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="dream-container relative z-10">
        <defs>
          <linearGradient id="dreamGradient" x1="0" y1="0" x2="200" y2="200">
            <stop offset="0%" stopColor="#d946ef" /> {/* Fuchsia */}
            <stop offset="50%" stopColor="#a855f7" /> {/* Purple */}
            <stop offset="100%" stopColor="#06b6d4" /> {/* Cyan */}
          </linearGradient>
          <linearGradient id="pupilGradient" x1="100" y1="50" x2="100" y2="150">
             <stop offset="0%" stopColor="#22d3ee" /> {/* Cyan */}
             <stop offset="100%" stopColor="#e879f9" /> {/* Light Fuchsia */}
          </linearGradient>
          <filter id="glow">
             <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
             <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
             </feMerge>
          </filter>
        </defs>

        {/* Outer Eye Shape */}
        <g className="eye-lid">
            <path 
                d="M 20 100 C 50 40, 150 40, 180 100 C 150 160, 50 160, 20 100 Z" 
                stroke="url(#dreamGradient)" 
                strokeWidth="3" 
                fill="rgba(15, 23, 42, 0.4)"
                filter="url(#glow)"
            />
             {/* Tech accents on rim */}
            <path d="M 40 100 C 60 130, 140 130, 160 100" stroke="#d946ef" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
        </g>

        {/* The Iris System */}
        <g className="iris-layer">
            <circle cx="100" cy="100" r="35" stroke="url(#dreamGradient)" strokeWidth="1" fill="none" opacity="0.6" />
            <circle cx="100" cy="100" r="30" stroke="url(#dreamGradient)" strokeWidth="2" fill="none" strokeDasharray="20 10" />
            
            {/* Geometric Iris Pattern */}
            <path d="M 100 70 L 100 130 M 70 100 L 130 100 M 80 80 L 120 120 M 120 80 L 80 120" stroke="#06b6d4" strokeWidth="0.5" opacity="0.5" />
        </g>

        {/* The Pupil / Core */}
        <circle cx="100" cy="100" r="12" fill="url(#pupilGradient)" filter="url(#glow)">
           <animate attributeName="r" values="12;14;12" dur="3s" repeatCount="indefinite" />
        </circle>
        
        {/* Reflection */}
        <circle cx="108" cy="92" r="3" fill="white" opacity="0.8" />
      </svg>
    </div>
  );
};

export default DreamEyeLogo;
