import { useRef } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

// ===================================================================
// Page transitions — one panel-slide for every route, pure CSS.
//
// Navigation is modelled as movement through a hierarchy: the app
// remembers whether you're going deeper or coming back out. Forward
// pages slide in from the right; going back slides them in from the
// left (.page-enter-fwd/.page-enter-back in index.css).
//
// Deliberately library-free: the previous motion-based version pulled
// ~100kb+ of animation runtime into the first-paint bundle. A keyed
// CSS animation gives the same enter feel with zero JS cost.
//
// The exam interface (/test) is routed raw — the NTA clone stays
// untouched: no wrapper transforms, no overlay.
// ===================================================================

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
  // entering page freezes the direction it was born with.
  const prevDepth = useRef(depthOf(location.pathname));
  const depth = depthOf(location.pathname);
  const direction = depth > prevDepth.current ? 1 : -1;
  prevDepth.current = depth;

  if (location.pathname === '/test') return <>{children}</>;

  return (
    <div
      key={location.pathname}
      className={direction >= 0 ? 'page-enter-fwd' : 'page-enter-back'}
    >
      {children}
    </div>
  );
}
