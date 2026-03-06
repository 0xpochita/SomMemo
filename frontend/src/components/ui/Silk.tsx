"use client";

import { useEffect, useRef } from "react";

interface SilkProps {
  speed?: number;
  scale?: number;
  color?: string;
  noiseIntensity?: number;
  rotation?: number;
}

export function Silk({
  speed = 2.3,
  scale = 0.5,
  color = "#f524ee",
  noiseIntensity = 2.1,
  rotation = 0,
}: SilkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    const animate = () => {
      const { width, height } = canvas;
      time += speed * 0.01;

      ctx.clearRect(0, 0, width, height);

      const gradient = ctx.createLinearGradient(
        0,
        0,
        width,
        height
      );

      const opacity = 0.15 + Math.sin(time) * 0.05;

      gradient.addColorStop(0, `${color}00`);
      gradient.addColorStop(0.3, `${color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`);
      gradient.addColorStop(0.7, `${color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`);
      gradient.addColorStop(1, `${color}00`);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      const circles = 5;
      for (let i = 0; i < circles; i++) {
        const x = width / 2 + Math.sin(time + i * 2) * (width * scale * 0.3);
        const y = height / 2 + Math.cos(time + i * 1.5) * (height * scale * 0.3);
        const radius = (50 + Math.sin(time * 0.5 + i) * 30) * scale;

        const circleGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        circleGradient.addColorStop(0, `${color}${Math.floor(opacity * 0.8 * 255).toString(16).padStart(2, '0')}`);
        circleGradient.addColorStop(1, `${color}00`);

        ctx.fillStyle = circleGradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, [speed, scale, color, noiseIntensity, rotation]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      style={{ transform: `rotate(${rotation}deg)` }}
    />
  );
}
