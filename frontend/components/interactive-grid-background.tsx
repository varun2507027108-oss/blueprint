"use client";

import React, { useEffect, useRef, useState } from "react";

export function InteractiveGridBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: -9999, y: -9999, active: false });
  const trailRef = useRef<Array<{ x: number; y: number; time: number }>>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Handle Resize and High DPI scaling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
        
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.resetTransform();
          ctx.scale(dpr, dpr);
        }
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Track Mouse movement relative to the container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const parent = container.parentElement;
    if (!parent) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = parent.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      mouseRef.current = { x, y, active: true };

      // Push to trail history
      const now = Date.now();
      const trail = trailRef.current;
      
      // Throttle trail points to prevent excessive rendering
      if (trail.length === 0) {
        trail.push({ x, y, time: now });
      } else {
        const lastPoint = trail[trail.length - 1];
        const timeElapsed = now - lastPoint.time;
        const distanceMoved = Math.hypot(x - lastPoint.x, y - lastPoint.y);
        if (timeElapsed > 16 || distanceMoved > 10) {
          trail.push({ x, y, time: now });
        }
      }
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    parent.addEventListener("mousemove", handleMouseMove);
    parent.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      parent.removeEventListener("mousemove", handleMouseMove);
      parent.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const startTime = Date.now();

    const render = () => {
      const { width, height } = dimensions;
      if (width === 0 || height === 0) {
        animationId = requestAnimationFrame(render);
        return;
      }

      const now = Date.now();
      const elapsed = now - startTime;

      // Prune old trail points
      trailRef.current = trailRef.current.filter((p) => now - p.time <= 400);

      // Clear Canvas
      ctx.clearRect(0, 0, width, height);

      // Fetch dynamic theme colors from computed CSS
      let accentRgb = "232, 163, 61"; // Default amber
      if (containerRef.current) {
        const style = window.getComputedStyle(containerRef.current);
        const accentHex = style.getPropertyValue("--color-accent").trim() || "#E8A33D";
        // Parse hex to rgb
        if (accentHex.startsWith("#")) {
          const hex = accentHex.replace("#", "");
          const r = parseInt(hex.substring(0, 2), 16);
          const g = parseInt(hex.substring(2, 4), 16);
          const b = parseInt(hex.substring(4, 6), 16);
          if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
            accentRgb = `${r}, ${g}, ${b}`;
          }
        }
      }

      // Draw Grid relative to the center
      const centerX = width / 2;
      const centerY = height / 2;

      // Major grid spacing: 120px, minor: 24px
      const minorSpacing = 24;
      const majorSpacing = 120;

      const startX = centerX - Math.ceil(centerX / minorSpacing) * minorSpacing;
      const startY = centerY - Math.ceil(centerY / minorSpacing) * minorSpacing;

      // 1. Static dim pass
      ctx.lineWidth = 1;
      
      // Draw vertical lines
      for (let x = startX; x <= width; x += minorSpacing) {
        const isMajor = Math.abs((x - centerX) % majorSpacing) < 1;
        ctx.strokeStyle = isMajor
          ? `rgba(${accentRgb}, 0.085)` // Major lines: 7-8%
          : `rgba(${accentRgb}, 0.035)`; // Minor lines: 3-4%
        ctx.beginPath();
        // Offset by 0.5px for crisp 1px lines
        ctx.moveTo(Math.round(x) - 0.5, 0);
        ctx.lineTo(Math.round(x) - 0.5, height);
        ctx.stroke();
      }

      // Draw horizontal lines
      for (let y = startY; y <= height; y += minorSpacing) {
        const isMajor = Math.abs((y - centerY) % majorSpacing) < 1;
        ctx.strokeStyle = isMajor
          ? `rgba(${accentRgb}, 0.085)`
          : `rgba(${accentRgb}, 0.035)`;
        ctx.beginPath();
        ctx.moveTo(0, Math.round(y) - 0.5);
        ctx.lineTo(width, Math.round(y) - 0.5);
        ctx.stroke();
      }

      // Draw static crosshairs for major intersections
      ctx.strokeStyle = `rgba(${accentRgb}, 0.085)`;
      for (let x = startX; x <= width; x += minorSpacing) {
        const isMajorX = Math.abs((x - centerX) % majorSpacing) < 1;
        if (!isMajorX) continue;
        for (let y = startY; y <= height; y += minorSpacing) {
          const isMajorY = Math.abs((y - centerY) % majorSpacing) < 1;
          if (!isMajorY) continue;

          ctx.beginPath();
          const rx = Math.round(x) - 0.5;
          const ry = Math.round(y) - 0.5;
          ctx.moveTo(rx - 4, ry);
          ctx.lineTo(rx + 4, ry);
          ctx.moveTo(rx, ry - 4);
          ctx.lineTo(rx, ry + 4);
          ctx.stroke();
        }
      }

      // 2. Active cursor glow & trail pass
      const activeGlows = [];
      if (mouseRef.current.active) {
        activeGlows.push({ x: mouseRef.current.x, y: mouseRef.current.y, factor: 1.0 });
      }
      
      trailRef.current.forEach((point) => {
        const age = now - point.time;
        const factor = 1 - age / 400;
        if (factor > 0) {
          activeGlows.push({ x: point.x, y: point.y, factor });
        }
      });

      const glowRadius = 220; // 180-250px range

      activeGlows.forEach(({ x, y, factor }) => {
        // Draw illuminated grid lines near cursor
        const radialGrad = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
        radialGrad.addColorStop(0, `rgba(${accentRgb}, ${0.25 * factor})`);
        radialGrad.addColorStop(0.3, `rgba(${accentRgb}, ${0.12 * factor})`);
        radialGrad.addColorStop(1, `rgba(${accentRgb}, 0)`);

        ctx.strokeStyle = radialGrad;
        ctx.lineWidth = 1;

        // Clip vertical lines drawn to the bounding box of the glow to optimize performance
        const startGlowX = Math.max(startX, x - glowRadius);
        const endGlowX = Math.min(width, x + glowRadius);

        for (let gx = startX; gx <= width; gx += minorSpacing) {
          if (gx >= startGlowX && gx <= endGlowX) {
            ctx.beginPath();
            ctx.moveTo(Math.round(gx) - 0.5, Math.max(0, y - glowRadius));
            ctx.lineTo(Math.round(gx) - 0.5, Math.min(height, y + glowRadius));
            ctx.stroke();
          }
        }

        const startGlowY = Math.max(startY, y - glowRadius);
        const endGlowY = Math.min(height, y + glowRadius);

        for (let gy = startY; gy <= height; gy += minorSpacing) {
          if (gy >= startGlowY && gy <= endGlowY) {
            ctx.beginPath();
            ctx.moveTo(Math.max(0, x - glowRadius), Math.round(gy) - 0.5);
            ctx.lineTo(Math.min(width, x + glowRadius), Math.round(gy) - 0.5);
            ctx.stroke();
          }
        }

        // Draw illuminated intersections
        for (let gx = startX; gx <= width; gx += minorSpacing) {
          if (gx < startGlowX || gx > endGlowX) continue;
          const isMajorX = Math.abs((gx - centerX) % majorSpacing) < 1;

          for (let gy = startY; gy <= height; gy += minorSpacing) {
            if (gy < startGlowY || gy > endGlowY) continue;
            const isMajorY = Math.abs((gy - centerY) % majorSpacing) < 1;

            const dist = Math.hypot(gx - x, gy - y);
            if (dist < glowRadius) {
              const distFactor = 1 - dist / glowRadius;
              const intersectionOpacity = 0.35 * distFactor * factor;
              
              ctx.strokeStyle = `rgba(${accentRgb}, ${intersectionOpacity})`;
              ctx.beginPath();
              const rx = Math.round(gx) - 0.5;
              const ry = Math.round(gy) - 0.5;

              if (isMajorX && isMajorY) {
                ctx.moveTo(rx - 6, ry);
                ctx.lineTo(rx + 6, ry);
                ctx.moveTo(rx, ry - 6);
                ctx.lineTo(rx, ry + 6);
              } else {
                ctx.moveTo(rx - 2, ry);
                ctx.lineTo(rx + 2, ry);
                ctx.moveTo(rx, ry - 2);
                ctx.lineTo(rx, ry + 2);
              }
              ctx.stroke();
            }
          }
        }
      });

      // 3. Scan Line Effect
      const scanCycle = 13000;
      const scanProgress = (elapsed % scanCycle) / scanCycle;
      const scanY = scanProgress * height;

      // Draw the scan line itself (thin horizontal line)
      ctx.strokeStyle = `rgba(${accentRgb}, 0.12)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, Math.round(scanY) - 0.5);
      ctx.lineTo(width, Math.round(scanY) - 0.5);
      ctx.stroke();

      // Brighten grid lines beneath scan line briefly
      const scanGlowHeight = 40;
      const scanGrad = ctx.createLinearGradient(0, scanY - scanGlowHeight, 0, scanY + scanGlowHeight);
      scanGrad.addColorStop(0, `rgba(${accentRgb}, 0)`);
      scanGrad.addColorStop(0.5, `rgba(${accentRgb}, 0.10)`);
      scanGrad.addColorStop(1, `rgba(${accentRgb}, 0)`);

      ctx.strokeStyle = scanGrad;
      ctx.lineWidth = 1;

      // Draw vertical lines in the scan line region
      for (let gx = startX; gx <= width; gx += minorSpacing) {
        ctx.beginPath();
        ctx.moveTo(Math.round(gx) - 0.5, Math.max(0, scanY - scanGlowHeight));
        ctx.lineTo(Math.round(gx) - 0.5, Math.min(height, scanY + scanGlowHeight));
        ctx.stroke();
      }

      // Draw horizontal lines in the scan line region
      for (let gy = startY; gy <= height; gy += minorSpacing) {
        if (gy >= scanY - scanGlowHeight && gy <= scanY + scanGlowHeight) {
          ctx.beginPath();
          ctx.moveTo(0, Math.round(gy) - 0.5);
          ctx.lineTo(width, Math.round(gy) - 0.5);
          ctx.stroke();
        }
      }

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [dimensions]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
      style={{
        maskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
      }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
      />
      {/* Central horizontal axis line with ambient glow */}
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1px] bg-gradient-to-r from-transparent via-accent/20 to-transparent pointer-events-none" />
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[6px] bg-gradient-to-r from-transparent via-accent/5 to-transparent blur-[2px] pointer-events-none" />
    </div>
  );
}
