import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from 'react';

// Orchestrates children: each StaggerItem cascades in after the last one.
// Zero-dependency — the parent stamps a per-index transition-delay and each
// item reveals itself via IntersectionObserver (.reveal/.is-in in index.css).
export default function StaggerReveal({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      {Children.map(children, (child, index) =>
        isValidElement<{ index?: number }>(child)
          ? cloneElement(child, { index })
          : child
      )}
    </div>
  );
}

export function StaggerItem({
  children,
  className = '',
  index = 0,
}: {
  children: ReactNode;
  className?: string;
  index?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-in');
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.disconnect();
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const style: CSSProperties = {
    transitionDelay: `${50 + index * 120}ms`,
  };

  return (
    <div ref={ref} className={`reveal ${className}`} style={style}>
      {children}
    </div>
  );
}

// Spring-feel hover: overshoots and settles instead of a linear scale.
// Pure CSS (.spring-tile in index.css) — no animation library needed.
export function SpringTile({ children }: { children: ReactNode }) {
  return <span className="spring-tile">{children}</span>;
}
