import { useEffect, useRef, useCallback } from "react";
import createGlobe from "cobe";
import type { OrphanMarker } from "@/data/countries";

interface GlobeOrphanAidProps {
  markers?: OrphanMarker[];
  className?: string;
  speed?: number;
}

export function GlobeOrphanAid({
  markers = [],
  className = "",
  speed = 0.004,
}: GlobeOrphanAidProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<{ x: number; y: number } | null>(null);
  const dragOffset = useRef({ phi: 0, theta: 0 });
  const phiOffsetRef = useRef(0);
  const thetaOffsetRef = useRef(0);
  const isPausedRef = useRef(false);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerInteracting.current = { x: e.clientX, y: e.clientY };
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing";
    isPausedRef.current = true;
  }, []);

  const handlePointerUp = useCallback(() => {
    if (pointerInteracting.current !== null) {
      phiOffsetRef.current += dragOffset.current.phi;
      thetaOffsetRef.current += dragOffset.current.theta;
      dragOffset.current = { phi: 0, theta: 0 };
    }
    pointerInteracting.current = null;
    if (canvasRef.current) canvasRef.current.style.cursor = "grab";
    isPausedRef.current = false;
  }, []);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (pointerInteracting.current !== null) {
        dragOffset.current = {
          phi: (e.clientX - pointerInteracting.current.x) / 300,
          theta: (e.clientY - pointerInteracting.current.y) / 1000,
        };
      }
    };
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [handlePointerUp]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    let globe: ReturnType<typeof createGlobe> | null = null;
    let animationId: number | null = null;
    let phi = 0;

    const isMobile =
      typeof window !== "undefined" && window.innerWidth < 768;
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Reduced motion: globe renders static (still draggable) by zeroing rotation.
    const effectiveSpeed = reduceMotion ? 0 : speed;

    let resizeObserver: ResizeObserver | null = null;
    let intersectionObserver: IntersectionObserver | null = null;

    function animate() {
      if (!globe) return;
      if (!isPausedRef.current) phi += effectiveSpeed;
      globe.update({
        phi: phi + phiOffsetRef.current + dragOffset.current.phi,
        theta: 0.2 + thetaOffsetRef.current + dragOffset.current.theta,
      });
      animationId = requestAnimationFrame(animate);
    }

    function startLoop() {
      // Guard against double-scheduling when re-entering the viewport.
      if (animationId !== null || !globe) return;
      animationId = requestAnimationFrame(animate);
    }

    function stopLoop() {
      if (animationId !== null) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    }

    function init() {
      const width = canvas.offsetWidth;
      if (width === 0 || globe) return;

      globe = createGlobe(canvas, {
        devicePixelRatio: isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 2),
        width,
        height: width,
        phi: 0,
        theta: 0.2,
        dark: 0.6,
        diffuse: 1.4,
        mapSamples: isMobile ? 8000 : 16000,
        mapBrightness: 8,
        baseColor: [0.1, 0.38, 0.65],
        markerColor: [0.675, 0.878, 0.337],
        glowColor: [0.33, 0.68, 0.9],
        markerElevation: 0.012,
        markers: markers.map((m) => ({
          location: m.location,
          size: m.crisis === "high" ? 0.06 : 0.04,
        })),
        arcs: [],
        arcColor: [1.0, 0.70, 0.0],
        arcWidth: 0.5,
        arcHeight: 0.25,
        opacity: 0.85,
      });

      startLoop();
      setTimeout(() => canvas && (canvas.style.opacity = "1"));

      // Pause the rAF loop whenever the canvas leaves the viewport.
      intersectionObserver = new IntersectionObserver((entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) {
          startLoop();
        } else {
          stopLoop();
        }
      });
      intersectionObserver.observe(canvas);
    }

    if (canvas.offsetWidth > 0) {
      init();
    } else {
      resizeObserver = new ResizeObserver((entries) => {
        if (entries[0]?.contentRect.width > 0) {
          resizeObserver?.disconnect();
          resizeObserver = null;
          init();
        }
      });
      resizeObserver.observe(canvas);
    }

    return () => {
      stopLoop();
      if (intersectionObserver) intersectionObserver.disconnect();
      if (resizeObserver) resizeObserver.disconnect();
      if (globe) globe.destroy();
    };
  }, [markers, speed]);

  return (
    <div className={`relative select-none ${className}`} aria-label="Interactive globe showing countries where Orphan Aid operates">
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        onPointerDown={handlePointerDown}
        style={{
          width: "100%",
          height: "100%",
          cursor: "grab",
          opacity: 0,
          transition: "opacity 1.2s ease",
          borderRadius: "50%",
          touchAction: "none",
        }}
      />
    </div>
  );
}
