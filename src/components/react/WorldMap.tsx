"use client";

import { useEffect, useMemo, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import DottedMap from "dotted-map";

interface DotConfig {
  start: { lat: number; lng: number; label?: string };
  end: { lat: number; lng: number; label?: string };
  color?: string;
}

interface MapProps {
  dots?: DotConfig[];
  lineColor?: string;
}

export function WorldMap({ dots = [], lineColor = "#1C6F9E" }: MapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // getSVG is expensive; the map and its rendered SVG never change, so memoize.
  const svgMap = useMemo(() => {
    const map = new DottedMap({ height: 100, grid: "diagonal" });
    return map.getSVG({
      radius: 0.22,
      color: "#FFFFFF18",
      shape: "circle",
      backgroundColor: "transparent",
    });
  }, []);

  // Pause SMIL <animate> pulses while the map is off-screen.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || prefersReducedMotion || typeof IntersectionObserver === "undefined") {
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      if (entry.isIntersecting) {
        svg.unpauseAnimations?.();
      } else {
        svg.pauseAnimations?.();
      }
    });
    observer.observe(svg);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  const projectPoint = (lat: number, lng: number) => {
    const x = (lng + 180) * (800 / 360);
    const y = (90 - lat) * (400 / 180);
    return { x, y };
  };

  const createCurvedPath = (
    start: { x: number; y: number },
    end: { x: number; y: number }
  ) => {
    const midX = (start.x + end.x) / 2;
    const midY = Math.min(start.y, end.y) - 60;
    return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
  };

  const uniqueColors = Array.from(new Set(dots.map(d => d.color ?? lineColor)));

  return (
    <div className="w-full aspect-[2/1] relative">
      <img
        src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
        className="h-full w-full [mask-image:linear-gradient(to_bottom,transparent,white_10%,white_90%,transparent)] pointer-events-none select-none"
        alt="World map showing Orphan Aid operations across 9 countries, with routes from Canada."
        draggable={false}
      />
      <svg
        ref={svgRef}
        viewBox="0 0 800 400"
        className="w-full h-full absolute inset-0 pointer-events-none select-none"
      >
        <defs>
          {uniqueColors.map(color => (
            <linearGradient
              key={`grad-${color}`}
              id={`path-gradient-${color.replace("#", "")}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="white" stopOpacity="0" />
              <stop offset="5%" stopColor={color} stopOpacity="1" />
              <stop offset="95%" stopColor={color} stopOpacity="1" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>

        {dots.map((dot, i) => {
          const startPoint = projectPoint(dot.start.lat, dot.start.lng);
          const endPoint = projectPoint(dot.end.lat, dot.end.lng);
          const color = dot.color ?? lineColor;
          return (
            <g key={`path-group-${i}`}>
              <motion.path
                d={createCurvedPath(startPoint, endPoint)}
                fill="none"
                stroke={`url(#path-gradient-${color.replace("#", "")})`}
                strokeWidth="1"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, delay: 0.25 * i, ease: "easeOut" }}
              />
            </g>
          );
        })}

        {dots.map((dot, i) => {
          const color = dot.color ?? lineColor;
          const sx = projectPoint(dot.start.lat, dot.start.lng).x;
          const sy = projectPoint(dot.start.lat, dot.start.lng).y;
          const ex = projectPoint(dot.end.lat, dot.end.lng).x;
          const ey = projectPoint(dot.end.lat, dot.end.lng).y;
          return (
            <g key={`points-group-${i}`}>
              {/* Start dot (Canada HQ — only rendered for i=0 to avoid overlap) */}
              {i === 0 && (
                <g>
                  <circle cx={sx} cy={sy} r="3" fill={color} />
                  <circle cx={sx} cy={sy} r="3" fill={color} opacity="0.4">
                    {!prefersReducedMotion && (
                      <>
                        <animate attributeName="r" from="3" to="12" dur="2.5s" begin="0s" repeatCount="indefinite" />
                        <animate attributeName="opacity" from="0.4" to="0" dur="2.5s" begin="0s" repeatCount="indefinite" />
                      </>
                    )}
                  </circle>
                </g>
              )}
              {/* End dot (country) */}
              <g>
                <circle cx={ex} cy={ey} r="2.5" fill={color} />
                <circle cx={ex} cy={ey} r="2.5" fill={color} opacity="0.4">
                  {!prefersReducedMotion && (
                    <>
                      <animate attributeName="r" from="2.5" to="9" dur="2s" begin={`${0.25 * i}s`} repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.4" to="0" dur="2s" begin={`${0.25 * i}s`} repeatCount="indefinite" />
                    </>
                  )}
                </circle>
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
