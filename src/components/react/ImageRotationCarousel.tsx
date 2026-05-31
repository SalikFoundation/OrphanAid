'use client'

import { useState, useEffect, useRef } from "react"
import { useReducedMotion } from "framer-motion"

interface ImageCard {
  id: string
  src: string
  alt: string
}

interface ImageRotationCarouselProps {
  images: ImageCard[]
}

export function ImageRotationCarousel({ images }: ImageRotationCarouselProps) {
  const prefersReducedMotion = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 })
  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [angles, setAngles] = useState<number[]>([])

  useEffect(() => {
    setAngles(images.map((_, i) => i * (360 / images.length)))
  }, [images.length])

  // Pause the rotation interval when the carousel scrolls off-screen.
  useEffect(() => {
    const node = containerRef.current
    if (!node || typeof IntersectionObserver === "undefined") return
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0]
      if (entry) setIsVisible(entry.isIntersecting)
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (prefersReducedMotion || !isVisible) return
    const interval = setInterval(() => {
      setAngles((prev) => prev.map((a) => (a + 0.4) % 360))
    }, 50)
    return () => clearInterval(interval)
  }, [prefersReducedMotion, isVisible])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePosition({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    })
  }

  const perspectiveX = (mousePosition.x - 0.5) * 15
  const perspectiveY = (mousePosition.y - 0.5) * 15
  const radius = 190

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center"
      style={{ width: "100%", height: "480px" }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false)
        setMousePosition({ x: 0.5, y: 0.5 })
      }}
    >
      {/* Soft glow behind carousel */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: "360px",
          height: "360px",
          background: "radial-gradient(circle, rgba(13,71,161,0.08) 0%, transparent 70%)",
        }}
      />

      {/* Carousel ring */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          perspective: "900px",
          transformStyle: "preserve-3d",
        }}
      >
        <div
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateX(${perspectiveY}deg) rotateY(${perspectiveX}deg)`,
            transition: isHovering ? "transform 0.1s ease-out" : "transform 0.6s ease-out",
          }}
        >
          {images.map((image, index) => {
            const angle = (angles[index] || 0) * (Math.PI / 180)
            const x = Math.cos(angle) * radius
            const y = Math.sin(angle) * radius * 0.42

            // Cards closer to bottom appear slightly larger (depth cue)
            const depthScale = 0.85 + (Math.sin(angle) + 1) * 0.075
            const zIndex = Math.round((Math.sin(angle) + 1) * 50)

            return (
              <div
                key={image.id}
                className="absolute"
                style={{
                  transform: `translate(${x}px, ${y}px) scale(${depthScale})`,
                  zIndex,
                  transformStyle: "preserve-3d",
                  transition: "transform 0.05s linear",
                }}
              >
                <div
                  className="relative rounded-2xl overflow-hidden shadow-2xl cursor-pointer group"
                  style={{ width: "140px", height: "180px" }}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    width={140}
                    height={180}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  {/* Shine overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {/* Depth shadow at bottom of each card */}
                  <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent" />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
