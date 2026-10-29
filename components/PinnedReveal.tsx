import type { ReactNode } from 'react';

/** Both sections stay in reading order, without scroll-driven overlays or clipping. */
export default function PinnedReveal({ base, incoming, id }: {
  base: ReactNode; incoming: ReactNode; scrollSpan?: number; id?: string;
}) {
  return <>{base}<div id={id}>{incoming}</div></>;
}
