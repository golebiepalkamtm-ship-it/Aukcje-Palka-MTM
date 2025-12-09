"use client";

import React, { useEffect, useRef } from "react";

interface Props {
  children: React.ReactNode;
  className?: string;
}

function clamp(value: number, min = 0, max = 100) {
  return Math.min(Math.max(value, min), max);
}

function round(value: number, precision = 3) {
  return parseFloat(value.toFixed(precision));
}

export default function ColoredGlowCard({ children, className = "" }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const center = (rect: DOMRect) => [rect.width / 2, rect.height / 2];

    const pointerPositionRelativeToElement = (e: PointerEvent, rect: DOMRect) => {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const px = clamp((100 / rect.width) * x);
      const py = clamp((100 / rect.height) * y);
      return { pixels: [x, y], percent: [px, py] };
    };

    const distanceFromCenter = (rect: DOMRect, x: number, y: number) => {
      const [cx, cy] = center(rect);
      return [x - cx, y - cy];
    };

    const angleFromPointerEvent = (dx: number, dy: number) => {
      let angleRadians = 0;
      let angleDegrees = 0;
      if (dx !== 0 || dy !== 0) {
        angleRadians = Math.atan2(dy, dx);
        angleDegrees = (angleRadians * (180 / Math.PI)) + 90;
        if (angleDegrees < 0) angleDegrees += 360;
      }
      return angleDegrees;
    };

    const closenessToEdge = (rect: DOMRect, x: number, y: number) => {
      const [cx, cy] = center(rect);
      const [dx, dy] = distanceFromCenter(rect, x, y);
      let kx = Infinity;
      let ky = Infinity;
      if (dx !== 0) kx = cx / Math.abs(dx);
      if (dy !== 0) ky = cy / Math.abs(dy);
      return clamp(1 / Math.min(kx, ky), 0, 1);
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const pos = pointerPositionRelativeToElement(e, rect);
      const [px, py] = pos.percent;
      const [x, y] = pos.pixels;
      const [dx, dy] = distanceFromCenter(rect, x, y);
      const edge = closenessToEdge(rect, x, y);
      const angle = angleFromPointerEvent(dx, dy);

      el.style.setProperty("--pointer-x", `${round(px)}%`);
      el.style.setProperty("--pointer-y", `${round(py)}%`);
      el.style.setProperty("--pointer-°", `${round(angle)}deg`);
      el.style.setProperty("--pointer-d", `${round(edge * 100)}`);
      el.classList.remove("animating");
    };

    el.addEventListener("pointermove", onPointerMove);

    // intro animation
    const playAnimation = () => {
      el.classList.add("animating");
      el.style.setProperty("--pointer-°", `110deg`);
      el.style.setProperty("--pointer-d", `0`);

      let start = performance.now();
      const duration = 2000;
      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        const angle = 110 + (465 - 110) * eased;
        el.style.setProperty("--pointer-°", `${Math.round(angle)}deg`);
        el.style.setProperty("--pointer-d", `${Math.round(t * 100)}`);
        if (t < 1) requestAnimationFrame(tick);
        else el.classList.remove("animating");
      };
      requestAnimationFrame(tick);
    };

    const timeout = setTimeout(playAnimation, 300);

    return () => {
      clearTimeout(timeout);
      el.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return (
    <div ref={ref} className={`colored-glow-card ${className}`}>
      {children}
    </div>
  );
}
