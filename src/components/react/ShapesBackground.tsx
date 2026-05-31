'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = 'from-white/[0.08]',
}: {
  className?: string;
  delay?: number;
  width?: number;
  height?: number;
  rotate?: number;
  gradient?: string;
}) {
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: -150, rotate: rotate - 15 }}
      animate={{ opacity: 1, y: 0, rotate }}
      transition={{ duration: 2.4, delay, ease: [0.23, 0.86, 0.39, 0.96], opacity: { duration: 1.2 } }}
      className={cn('absolute', className)}
    >
      <motion.div
        animate={shouldReduce ? {} : { y: [0, 15, 0] }}
        transition={{ duration: 12, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
        style={{ width, height }}
        className="relative"
      >
        <div
          className={cn(
            'absolute inset-0 rounded-full',
            'bg-gradient-to-r to-transparent',
            gradient,
            'backdrop-blur-[2px] border-2 border-white/[0.2]',
            'shadow-[0_8px_32px_0_rgba(86,172,224,0.08)]',
            'after:absolute after:inset-0 after:rounded-full',
            'after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.15),transparent_70%)]'
          )}
        />
      </motion.div>
    </motion.div>
  );
}

export function ShapesBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <ElegantShape
        delay={0.3}
        width={500}
        height={120}
        rotate={12}
        gradient="from-[#1C6F9E]/[0.18]"
        className="left-[-8%] top-[15%]"
      />
      <ElegantShape
        delay={0.5}
        width={400}
        height={100}
        rotate={-15}
        gradient="from-[#FFB300]/[0.12]"
        className="right-[-4%] top-[65%]"
      />
      <ElegantShape
        delay={0.4}
        width={280}
        height={75}
        rotate={-8}
        gradient="from-[#1C6F9E]/[0.14]"
        className="left-[8%] bottom-[8%]"
      />
      <ElegantShape
        delay={0.6}
        width={180}
        height={55}
        rotate={20}
        gradient="from-[#FFB300]/[0.10]"
        className="right-[18%] top-[8%]"
      />
      <ElegantShape
        delay={0.7}
        width={140}
        height={38}
        rotate={-25}
        gradient="from-[#1C6F9E]/[0.10]"
        className="left-[22%] top-[6%]"
      />
    </div>
  );
}
