import React, { useId } from "react";
import { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import type { Container, SingleOrMultiple } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";
import { loadHeartShape } from "@tsparticles/shape-heart";
import { cn } from "@/lib/utils";
import { motion, useAnimation } from "framer-motion";

type SparklesCoreProps = {
  id?: string;
  className?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  speed?: number;
  particleColor?: string | string[];
  particleDensity?: number;
  particleShape?: string;
};

export const SparklesCore = ({
  id,
  className,
  background = "#0d47a1",
  minSize = 1,
  maxSize = 3,
  speed = 3,
  particleColor = "#ffffff",
  particleDensity = 80,
  particleShape = "circle",
}: SparklesCoreProps) => {
  const [init, setInit] = useState(false);
  const controls = useAnimation();
  const generatedId = useId();

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
      await loadHeartShape(engine);
    }).then(() => setInit(true));
  }, []);

  const particlesLoaded = async (container?: Container) => {
    if (container) {
      controls.start({ opacity: 1, transition: { duration: 1 } });
    }
  };

  return (
    <motion.div animate={controls} className={cn("opacity-0", className)}>
      {init && (
        <Particles
          id={id || generatedId}
          className="h-full w-full"
          particlesLoaded={particlesLoaded}
          options={{
            background: { color: { value: background } },
            fullScreen: { enable: false, zIndex: 1 },
            fpsLimit: 60,
            reducedMotion: { enable: true, minimizeMovement: true },
            interactivity: {
              events: {
                onClick: { enable: true, mode: "push" },
                onHover: { enable: false, mode: "repulse" },
                resize: { enable: true },
              },
              modes: {
                push: { quantity: 3 },
              },
            },
            particles: {
              color: { value: particleColor },
              move: {
                direction: "none",
                enable: true,
                outModes: { default: "out" },
                random: false,
                speed: { min: 0.1, max: 0.8 },
                straight: false,
              },
              number: {
                density: { enable: true, width: 400, height: 400 },
                value: particleDensity,
              },
              opacity: {
                value: { min: 0.1, max: 0.9 },
                animation: {
                  count: 0,
                  enable: true,
                  speed,
                  decay: 0,
                  delay: 0,
                  sync: false,
                  mode: "auto",
                  startValue: "random",
                  destroy: "none",
                },
              },
              shape: { type: particleShape },
              size: {
                value: { min: minSize, max: maxSize },
              },
              twinkle: {
                particles: { enable: true, frequency: 0.08, opacity: 1 },
              },
            },
            detectRetina: true,
          }}
        />
      )}
    </motion.div>
  );
};
