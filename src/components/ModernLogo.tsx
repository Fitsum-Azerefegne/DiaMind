export const ModernLogo = ({ className = "h-8 w-auto" }: { className?: string }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-sm"
        >
          {/* Outer circle with gradient */}
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#1d4ed8" />
              <stop offset="100%" stopColor="#1e40af" />
            </linearGradient>
            <linearGradient id="innerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#dbeafe" />
              <stop offset="100%" stopColor="#bfdbfe" />
            </linearGradient>
          </defs>
          
          {/* Main circle */}
          <circle
            cx="20"
            cy="20"
            r="18"
            fill="url(#logoGradient)"
            className="animate-pulse"
            style={{ animationDuration: "3s" }}
          />
          
          {/* Inner design - stylized "D" */}
          <path
            d="M12 12 C12 12, 16 8, 22 12 C28 16, 28 24, 22 28 C16 32, 12 28, 12 28 Z"
            fill="url(#innerGradient)"
            stroke="white"
            strokeWidth="1"
          />
          
          {/* Flowing accent */}
          <path
            d="M10 20 Q15 15, 20 20 Q25 25, 30 20"
            stroke="rgba(255,255,255,0.6)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            className="animate-pulse"
            style={{ animationDuration: "2s", animationDelay: "0.5s" }}
          />
        </svg>
      </div>
      <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
        DiaMind
      </span>
    </div>
  );
};