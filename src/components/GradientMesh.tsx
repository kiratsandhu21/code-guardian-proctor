import React, { useEffect, useRef } from 'react';

const GradientMesh: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create gradient mesh
    const createGradientMesh = () => {
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;

      // Create radial gradients at different positions
      const gradients = [
        { x: width * 0.2, y: height * 0.3, radius: width * 0.4, color: 'rgba(59, 130, 246, 0.08)' },
        { x: width * 0.8, y: height * 0.7, radius: width * 0.3, color: 'rgba(147, 51, 234, 0.08)' },
        { x: width * 0.5, y: height * 0.8, radius: width * 0.5, color: 'rgba(16, 185, 129, 0.06)' },
        { x: width * 0.1, y: height * 0.6, radius: width * 0.2, color: 'rgba(245, 158, 11, 0.06)' }
      ];

      gradients.forEach(gradient => {
        const radialGradient = ctx.createRadialGradient(
          gradient.x, gradient.y, 0,
          gradient.x, gradient.y, gradient.radius
        );
        radialGradient.addColorStop(0, gradient.color);
        radialGradient.addColorStop(1, 'transparent');

        ctx.fillStyle = radialGradient;
        ctx.fillRect(0, 0, width, height);
      });
    };

    createGradientMesh();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: -2 }}
    />
  );
};

export default GradientMesh; 