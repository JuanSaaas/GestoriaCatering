import type { ReactNode } from 'react';

/** Readable before hydration, at any zoom and without motion. */
export default function Reveal({ children, className = '' }: {
  children: ReactNode; className?: string; delay?: number;
}) {
  return <div className={className}>{children}</div>;
}
