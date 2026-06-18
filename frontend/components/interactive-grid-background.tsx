"use client";

import React, { useEffect, useRef, useState } from "react";

export function InteractiveGridBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isTouchOrReducedMotion, setIsTouchOrReducedMotion] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const mediaQueryReduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    const checkSettings = () => {
      const isReduced = mediaQueryReduced.matches;
      const isTouch = typeof window !== "undefined" && (
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-ignore
        (navigator.msMaxTouchPoints && navigator.msMaxTouchPoints > 0)
      );
      setIsTouchOrReducedMotion(isReduced || isTouch);
    };

    checkSettings();

    mediaQueryReduced.addEventListener("change", checkSettings);

    return () => {
      mediaQueryReduced.removeEventListener("change", checkSettings);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (isTouchOrReducedMotion) return;

    const container = containerRef.current;
    if (!container) return;

    const parent = container.parentElement;
    if (!parent) return;

    let frameId: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }

      frameId = requestAnimationFrame(() => {
        const rect = parent.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        container.style.setProperty("--mx", `${x}px`);
        container.style.setProperty("--my", `${y}px`);
      });
    };

    const handleMouseLeave = () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
      frameId = requestAnimationFrame(() => {
        container.style.setProperty("--mx", "-9999px");
        container.style.setProperty("--my", "-9999px");
      });
    };

    parent.addEventListener("mousemove", handleMouseMove);
    parent.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
      parent.removeEventListener("mousemove", handleMouseMove);
      parent.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isTouchOrReducedMotion]);

  const cellWidth = 120;
  const cellHeight = 120;
  
  // Calculate offsets so a grid intersection aligns exactly with the center of the container
  const offsetX = dimensions.width ? (dimensions.width / 2 - cellWidth / 2) % cellWidth : 0;
  const offsetY = dimensions.height ? (dimensions.height / 2 - cellHeight / 2) % cellHeight : 0;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
      style={{
        "--mx": "-9999px",
        "--my": "-9999px",
        maskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
      } as React.CSSProperties}
    >
      {/* Layer 1: Static dim grid */}
      <div className="absolute inset-0 opacity-[0.08] text-border-subtle dark:opacity-[0.06]">
        <GridSvg offsetX={offsetX} offsetY={offsetY} />
      </div>

      {/* Layer 2: Glowing accent grid */}
      {!isTouchOrReducedMotion && (
        <div
          className="absolute inset-0 opacity-45 text-accent transition-opacity duration-300"
          style={{
            maskImage:
              "radial-gradient(circle 300px at var(--mx) var(--my), white 0%, transparent 70%)",
            WebkitMaskImage:
              "radial-gradient(circle 300px at var(--mx) var(--my), white 0%, transparent 70%)",
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat",
          }}
        >
          <GridSvg offsetX={offsetX} offsetY={offsetY} />
        </div>
      )}

      {/* Central horizontal axis line with ambient glow */}
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent pointer-events-none" />
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[6px] bg-gradient-to-r from-transparent via-accent/10 to-transparent blur-[2px] pointer-events-none" />
    </div>
  );
}

interface GridSvgProps {
  offsetX: number;
  offsetY: number;
}

function GridSvg({ offsetX, offsetY }: GridSvgProps) {
  const cellWidth = 120;
  const cellHeight = 120;
  
  return (
    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern
          id="blueprint-grid"
          width={cellWidth}
          height={cellHeight}
          patternUnits="userSpaceOnUse"
          patternTransform={`translate(${offsetX}, ${offsetY})`}
        >
          {/* Faint grid lines intersecting at center */}
          <path
            d={`M ${cellWidth / 2} 0 V ${cellHeight} M 0 ${cellHeight / 2} H ${cellWidth}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.35"
          />
          {/* Faint crosshair (+) at the intersection */}
          <path
            d={`M ${cellWidth / 2 - 4} ${cellHeight / 2} H ${cellWidth / 2 + 4} M ${cellWidth / 2} ${cellHeight / 2 - 4} V ${cellHeight / 2 + 4}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.75"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#blueprint-grid)" />
    </svg>
  );
}
