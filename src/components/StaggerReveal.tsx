import { motion } from 'motion/react';
import type { ReactNode } from 'react';

const ease = [0.22, 1, 0.36, 1] as const;

// Orchestrates children: each StaggerItem cascades in after the last one,
// no per-child delays needed. Just nest — the variant flow does the timing.
export default function StaggerReveal({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
      }}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 18 },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
      }}
    >
      {children}
    </motion.div>
  );
}

// Spring-physics hover: overshoots and settles instead of a linear scale.
// Kept on the icon tile so it swaps in for the old CSS group-hover rule.
export function SpringTile({ children }: { children: ReactNode }) {
  return (
    <motion.div
      className="inline-flex"
      whileHover={{ scale: 1.12, rotate: 4 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 320, damping: 14 }}
    >
      {children}
    </motion.div>
  );
}