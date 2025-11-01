export const AwarenessRibbon = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`absolute pointer-events-none ${className}`}>
      <svg
        width="200"
        height="120"
        viewBox="0 0 200 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="opacity-20 animate-pulse"
        style={{ animationDuration: "4s" }}
      >
        <defs>
          <linearGradient id="ribbonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#007DC3" />
            <stop offset="30%" stopColor="#3B82F6" />
            <stop offset="70%" stopColor="#1E40AF" />
            <stop offset="100%" stopColor="#007DC3" />
          </linearGradient>
          <filter id="ribbonShadow">
            <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.2"/>
          </filter>
        </defs>
        
        {/* Left loop */}
        <path
          d="M30 60 Q10 30, 40 20 Q70 10, 80 40 Q90 70, 60 80 Q30 90, 30 60 Z"
          fill="url(#ribbonGradient)"
          filter="url(#ribbonShadow)"
        />
        
        {/* Right loop */}
        <path
          d="M170 60 Q190 30, 160 20 Q130 10, 120 40 Q110 70, 140 80 Q170 90, 170 60 Z"
          fill="url(#ribbonGradient)"
          filter="url(#ribbonShadow)"
        />
        
        {/* Center twist */}
        <path
          d="M80 40 Q100 35, 120 40 Q100 65, 80 60 Q100 55, 120 60 Q100 45, 80 40 Z"
          fill="url(#ribbonGradient)"
          filter="url(#ribbonShadow)"
        />
        
        {/* Highlight for 3D effect */}
        <path
          d="M35 45 Q50 35, 65 45 Q80 35, 95 45"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M105 45 Q120 35, 135 45 Q150 35, 165 45"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="2"
          fill="none"
        />
      </svg>
    </div>
  );
};