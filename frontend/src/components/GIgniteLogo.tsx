import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const GIgniteLogo: React.FC<LogoProps> = ({ className = "w-10 h-10", size = 40 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Outer Ring Gradient - Muted Amethyst to Violet */}
        <linearGradient id="gigniteOuterRing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C084FC" />
          <stop offset="50%" stopColor="#8B2CB0" />
          <stop offset="100%" stopColor="#581C87" />
        </linearGradient>

        {/* Inner Ring Gradient - Soft Deep Violet */}
        <linearGradient id="gigniteInnerRing" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7E22CE" />
          <stop offset="100%" stopColor="#3B0764" />
        </linearGradient>

        {/* Flame G Swirl Gradient - Ethereal Violet to Lavender */}
        <linearGradient id="gigniteFlame" x1="20%" y1="90%" x2="80%" y2="10%">
          <stop offset="0%" stopColor="#431CB8" />
          <stop offset="35%" stopColor="#6D28D9" />
          <stop offset="70%" stopColor="#9333EA" />
          <stop offset="100%" stopColor="#D8B4FE" />
        </linearGradient>

        {/* Candle Flame Accent */}
        <linearGradient id="gigniteCandleFlame" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#F3E8FF" />
        </linearGradient>
      </defs>

      {/* Outer Circle Ring */}
      <circle
        cx="100"
        cy="100"
        r="88"
        stroke="url(#gigniteOuterRing)"
        strokeWidth="10"
        fill="none"
        opacity="0.85"
      />

      {/* Inner Circle Ring */}
      <circle
        cx="100"
        cy="100"
        r="75"
        stroke="url(#gigniteInnerRing)"
        strokeWidth="6"
        fill="none"
        opacity="0.9"
      />

      {/* Stylized Swirling G Flame Blades */}
      {/* Outer Flame Arch / Top Swirl */}
      <path
        d="M135 32 C132 45, 140 52, 138 65 C135 75, 126 82, 122 92 C115 108, 126 122, 118 138 C108 156, 82 165, 62 155 C42 145, 35 120, 42 100 C48 84, 62 72, 78 68 C86 66, 94 68, 98 62 C104 54, 112 42, 120 35 C124 30, 132 26, 135 32 Z"
        fill="url(#gigniteFlame)"
        opacity="0.95"
      />

      {/* Mid Swirling Feather Flame */}
      <path
        d="M142 38 C138 50, 148 62, 142 75 C136 86, 122 96, 115 108 C105 125, 95 142, 75 148 C60 152, 48 140, 50 125 C52 110, 68 98, 82 92 C98 86, 112 75, 122 60 C128 50, 136 42, 142 38 Z"
        fill="#9333EA"
        opacity="0.7"
      />

      {/* Inner Swirl Core Forming the "G" Loop */}
      <path
        d="M80 128 C70 125, 65 115, 68 105 C72 94, 85 88, 96 88 C110 88, 122 98, 125 112 C126 118, 120 122, 114 122 C106 122, 102 114, 95 112 C88 110, 80 114, 78 122 C77 125, 78 127, 80 128 Z"
        fill="#C084FC"
      />

      {/* Flame Crest Highlights */}
      <path
        d="M138 24 C136 32, 142 36, 140 44 C138 48, 132 52, 130 58 C126 68, 132 75, 128 85 C125 92, 118 96, 115 102 C118 90, 132 82, 135 70 C138 58, 130 50, 136 38 C138 32, 140 28, 138 24 Z"
        fill="#E9D5FF"
        opacity="0.85"
      />

      {/* Small Floating Sparks */}
      <circle cx="145" cy="22" r="2.5" fill="#E9D5FF" />
      <circle cx="138" cy="15" r="2" fill="#C084FC" />
      <circle cx="152" cy="32" r="1.5" fill="#D8B4FE" />

      {/* Candle "i" with Flame */}
      {/* Candle Stem */}
      <rect x="131" y="100" width="8" height="26" rx="3" fill="#D8B4FE" opacity="0.9" />
      {/* Candle Flame */}
      <path
        d="M135 84 C132 90, 130 94, 132 98 C133 100, 137 100, 138 98 C140 94, 138 90, 135 84 Z"
        fill="url(#gigniteCandleFlame)"
      />
    </svg>
  );
};
