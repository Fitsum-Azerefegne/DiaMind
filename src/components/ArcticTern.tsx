import { useState, useEffect } from "react";
import arcticTernLogo from "@/assets/arctic-tern-logo.png";
import { Button } from "./ui/button";
import { X } from "lucide-react";

export const ArcticTern = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [position, setPosition] = useState({ x: -100, y: 30 });
  const [isHovered, setIsHovered] = useState(false);
  const [isFlying, setIsFlying] = useState(true);

  useEffect(() => {
    if (!isVisible || !isFlying) return;

    const interval = setInterval(() => {
      setPosition((prev) => {
        const newX = prev.x + 2;
        // If tern has flown off screen, reset to left
        if (newX > window.innerWidth + 100) {
          return { x: -100, y: Math.random() * 40 + 20 };
        }
        return { x: newX, y: prev.y + Math.sin(newX * 0.01) * 0.5 };
      });
    }, 30);

    return () => clearInterval(interval);
  }, [isVisible, isFlying]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <div
        className={`absolute transition-all duration-300 pointer-events-auto ${
          isFlying ? "" : "animate-none"
        }`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}%`,
          transform: isHovered ? "scale(1.2) rotate(5deg)" : "scale(1)",
        }}
        onMouseEnter={() => {
          setIsHovered(true);
          setIsFlying(false);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          setTimeout(() => setIsFlying(true), 1000);
        }}
      >
        <img
          src={arcticTernLogo}
          alt="Arctic Tern"
          className="h-16 w-16 drop-shadow-lg animate-shimmer cursor-pointer"
        />
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 pointer-events-auto opacity-50 hover:opacity-100"
        onClick={() => setIsVisible(false)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};
