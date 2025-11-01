import { useEffect, useRef } from "react";

export const FlowingRibbon = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const drawRibbon = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerY = canvas.height * 0.4;
      const amplitude = 60;
      const frequency = 0.003;
      const speed = 0.02;
      
      // Create gradient
      const gradient = ctx.createLinearGradient(0, centerY - amplitude, 0, centerY + amplitude);
      gradient.addColorStop(0, "rgba(59, 130, 246, 0.1)");
      gradient.addColorStop(0.5, "rgba(59, 130, 246, 0.3)");
      gradient.addColorStop(1, "rgba(59, 130, 246, 0.1)");
      
      ctx.fillStyle = gradient;
      ctx.strokeStyle = "rgba(59, 130, 246, 0.4)";
      ctx.lineWidth = 2;
      
      // Draw flowing ribbon
      ctx.beginPath();
      
      for (let x = 0; x <= canvas.width; x += 2) {
        const y1 = centerY + Math.sin(x * frequency + time * speed) * amplitude;
        const y2 = centerY + Math.sin(x * frequency + time * speed + 0.5) * amplitude * 0.7;
        
        if (x === 0) {
          ctx.moveTo(x, y1);
        } else {
          ctx.lineTo(x, y1);
        }
      }
      
      // Complete the ribbon shape
      for (let x = canvas.width; x >= 0; x -= 2) {
        const y2 = centerY + Math.sin(x * frequency + time * speed + 0.5) * amplitude * 0.7;
        ctx.lineTo(x, y2);
      }
      
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      time++;
      animationId = requestAnimationFrame(drawRibbon);
    };

    resizeCanvas();
    drawRibbon();

    window.addEventListener("resize", resizeCanvas);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: "transparent" }}
    />
  );
};