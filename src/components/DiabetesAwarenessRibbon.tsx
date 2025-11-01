import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

export const DiabetesAwarenessRibbon = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className="fixed top-6 right-6 z-50 cursor-pointer transition-all duration-300 hover:scale-110"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <svg
              width="60"
              height="80"
              viewBox="0 0 60 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-lg"
            >
              <defs>
                <linearGradient id="ribbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={isHovered ? "#1E40AF" : "#3B82F6"} />
                  <stop offset="50%" stopColor={isHovered ? "#3B82F6" : "#60A5FA"} />
                  <stop offset="100%" stopColor={isHovered ? "#6B7280" : "#9CA3AF"} />
                </linearGradient>
              </defs>
              
              {/* Ribbon loop */}
              <path
                d="M15 20 Q5 10, 20 5 Q35 0, 45 15 Q55 30, 40 40 Q25 50, 15 35 Q5 20, 15 20 Z"
                fill="url(#ribbonGrad)"
                className="transition-all duration-300"
              />
              
              {/* Ribbon tail */}
              <path
                d="M25 45 L35 45 L40 65 L30 70 L20 65 Z"
                fill="url(#ribbonGrad)"
                className="transition-all duration-300"
              />
              

              
              {/* Highlight */}
              <path
                d="M20 15 Q30 10, 40 15"
                stroke="rgba(255,255,255,0.6)"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </div>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-xs">
          <p className="text-sm">
            This ribbon honors everyone affected by diabetes. You're part of a supportive community! 💙
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};