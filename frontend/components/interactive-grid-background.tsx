"use client";

import React, { useEffect, useRef, useState } from "react";

export function InteractiveGridBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isTouchOrReducedMotion, setIsTouchOrReducedMotion] = useState(true);

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

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
      style={{
        "--mx": "-9999px",
        "--my": "-9999px",
      } as React.CSSProperties}
    >
      {/* Layer 1: Static dim grid */}
      <div className="absolute inset-0 opacity-[0.08] text-border-subtle dark:opacity-[0.06]">
        <GridSvg />
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
          <GridSvg />
        </div>
      )}
    </div>
  );
}

function GridSvg() {
  return (
    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern
          id="blueprint-grid"
          width="56"
          height="56"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 56 0 L 0 0 0 56"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#blueprint-grid)" />
    </svg>
  );
}
