import React, { useEffect, useRef } from 'react';

interface FloatingShape {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  type: 'circle' | 'square' | 'triangle';
}

const BackgroundElements: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shapesRef = useRef<FloatingShape[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize floating shapes
    const initShapes = () => {
      const shapes: FloatingShape[] = [];
      const numShapes = 15; // Performance-optimized number
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;

      for (let i = 0; i < numShapes; i++) {
        shapes.push({
          id: i,
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 60 + 20,
          speed: Math.random() * 0.5 + 0.1,
          opacity: Math.random() * 0.5 + 0.2,
          type: ['circle', 'square', 'triangle'][Math.floor(Math.random() * 3)] as any
        });
      }
      shapesRef.current = shapes;
    };

    initShapes();

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;

      shapesRef.current.forEach(shape => {
        // Update position
        shape.y -= shape.speed;
        if (shape.y < -shape.size) {
          shape.y = height + shape.size;
          shape.x = Math.random() * width;
        }

        // Draw shape
        ctx.save();
        ctx.globalAlpha = shape.opacity;
        ctx.fillStyle = '#d1d5db';
        ctx.strokeStyle = '#9ca3af';
        ctx.lineWidth = 2;

        switch (shape.type) {
          case 'circle':
            ctx.beginPath();
            ctx.arc(shape.x, shape.y, shape.size / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            break;
          case 'square':
            ctx.fillRect(shape.x - shape.size / 2, shape.y - shape.size / 2, shape.size, shape.size);
            ctx.strokeRect(shape.x - shape.size / 2, shape.y - shape.size / 2, shape.size, shape.size);
            break;
          case 'triangle':
            ctx.beginPath();
            ctx.moveTo(shape.x, shape.y - shape.size / 2);
            ctx.lineTo(shape.x - shape.size / 2, shape.y + shape.size / 2);
            ctx.lineTo(shape.x + shape.size / 2, shape.y + shape.size / 2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
        }
        ctx.restore();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: -1 }}
    />
  );
};

export default BackgroundElements; 