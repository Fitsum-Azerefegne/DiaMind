import { useEffect, useRef } from "react";

export const DiabetesRibbon = () => {
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
      
      const centerY = canvas.height * 0.3;
      const ribbonWidth = 80;
      const twistFreq = 0.008;
      const flowSpeed = 0.01;
      
      // Create gradient for diabetes awareness blue
      const gradient = ctx.createLinearGradient(0, centerY - ribbonWidth, 0, centerY + ribbonWidth);
      gradient.addColorStop(0, "rgba(0, 125, 195, 0.1)"); // Diabetes blue
      gradient.addColorStop(0.3, "rgba(0, 125, 195, 0.4)");
      gradient.addColorStop(0.7, "rgba(59, 130, 246, 0.4)");
      gradient.addColorStop(1, "rgba(59, 130, 246, 0.1)");
      
      ctx.fillStyle = gradient;
      ctx.strokeStyle = "rgba(0, 125, 195, 0.3)";
      ctx.lineWidth = 1;
      
      // Draw twisted ribbon path
      ctx.beginPath();
      
      for (let x = -100; x <= canvas.width + 100; x += 3) {
        const twist = Math.sin(x * twistFreq + time * flowSpeed) * 0.8;
        const flow = Math.sin(x * 0.002 + time * flowSpeed * 0.5) * 30;
        
        const y1 = centerY + flow + twist * ribbonWidth;
        const y2 = centerY + flow - twist * ribbonWidth;
        
        if (x === -100) {
          ctx.moveTo(x, y1);
        } else {
          ctx.lineTo(x, y1);
        }
      }
      
      // Complete the ribbon shape
      for (let x = canvas.width + 100; x >= -100; x -= 3) {
        const twist = Math.sin(x * twistFreq + time * flowSpeed) * 0.8;
        const flow = Math.sin(x * 0.002 + time * flowSpeed * 0.5) * 30;
        
        const y2 = centerY + flow - twist * ribbonWidth;
        ctx.lineTo(x, y2);
      }
      
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      // Add subtle shimmer effect
      const shimmerGradient = ctx.createLinearGradient(
        time * 2, 0, 
        time * 2 + 200, 0
      );
      shimmerGradient.addColorStop(0, "rgba(255, 255, 255, 0)");
      shimmerGradient.addColorStop(0.5, "rgba(255, 255, 255, 0.1)");
      shimmerGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      
      ctx.fillStyle = shimmerGradient;
      ctx.fill();
      
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