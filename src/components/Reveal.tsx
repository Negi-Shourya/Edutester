import { motion } from 'motion/react';
import type { ReactNode } from 'react';

const ease = [0.22, 1, 0.36, 1] as const;

// Fades content up once it scrolls into view. Uses motion's whileInView so
// it stays a single prop away from staggered variants; MotionConfig's
// reducedMotion="user" snaps it instantly for reduced-motion users.
export default function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.6, ease, delay: delay / 1000 }}
    >
      {children}
    </motion.div>
  );
}