'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/** Give client-side navigation the title and focus behavior of a full page load. */
export default function RouteAccessibility() {
  const pathname = usePathname();
  const previous = useRef(pathname);
  useEffect(() => {
    const navigated = previous.current !== pathname;
    previous.current = pathname;
    const main = document.querySelector('main');
    if (!main) return;
    const updateTitle = () => {
      const title = main.querySelector('h1')?.textContent?.trim();
      if (title) document.title = `${title} · La Mesa Perfecta`;
    };
    updateTitle();
    if (navigated) {
      const target = main.querySelector<HTMLElement>('h1') || main;
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }
    const observer = new MutationObserver(updateTitle);
    observer.observe(main, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [pathname]);
  return null;
}
