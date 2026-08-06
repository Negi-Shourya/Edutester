import { AnimatePresence, motion } from 'motion/react';
import { useRef } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

// ===================================================================
// Page transitions — one panel-slide for every route.
//
// Navigation is modelled as movement through a hierarchy: the app
// remembers whether you're going deeper or coming back out. Forward
// pages slide in from the right; going back slides them in from the
// left — the same physical motion on dashboard, marketing and auth
// screens alike.
//
// mode="popLayout" pops the old page out of layout while the new one
// mounts beneath it — no blank "loading" gap, ever.
//
// The exam interface (/test) is routed raw — the NTA clone stays
// untouched: no wrapper transforms, no overlay.
// ===================================================================

const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const EASE_IN = [0.7, 0, 0.84, 0] as const;

// Route hierarchy — depth decides forward/back motion.
const DEPTH: string[][] = [
  ['/', '/landing'],
  ['/pricing', '/contact', '/login', '/signup'],
  ['/dashboard', '/chapter-tests', '/paper-tests', '/profile', '/admin'],
];

function depthOf(pathname: string): number {
  for (let i = 0; i < DEPTH.length; i++) {
    if (DEPTH[i].includes(pathname)) return i;
  }
  return DEPTH.length; // unknown routes (e.g. /test) are deepest
}

export default function PageTransition({ children }: { children: ReactNode }) {
  const location = useLocation();

  // Did we go deeper into the app, or back out? Kept in a ref so the
  // exiting page freezes the direction it was born with.
  const prevDepth = useRef(depthOf(location.pathname));
  const depth = depthOf(location.pathname);
  const direction = depth > prevDepth.current ? 1 : -1;
  prevDepth.current = depth;

  if (location.pathname === '/test') return <>{children}</>;

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ x: direction * 44, y: 6, scale: 1, opacity: 0, filter: 'blur(0px)' }}
        animate={{ x: 0, y: 0, scale: 1, opacity: 1, filter: 'blur(0px)' }}
        exit={{ x: -direction * 30, y: -6, scale: 1, opacity: 0, filter: 'blur(0px)', transition: { duration: 0.18, ease: EASE_IN } }}
        transition={{ duration: 0.38, ease: EASE_OUT }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}