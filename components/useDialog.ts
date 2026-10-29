'use client';

import { useEffect, useRef } from 'react';

const dialogs: HTMLElement[] = [];

export function useDialog<T extends HTMLElement>(onClose: () => void) {
  const ref = useRef<T>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = ref.current;
    if (!dialog) return;
    dialogs.push(dialog);
    const background: { element: HTMLElement; inert: boolean }[] = [];
    // Inert only siblings along the ancestor path, so the dialog remains usable.
    let branch: HTMLElement = dialog;
    while (branch.parentElement) {
      for (const sibling of Array.from(branch.parentElement.children)) {
        if (sibling instanceof HTMLElement && sibling !== branch && !['SCRIPT', 'STYLE', 'LINK'].includes(sibling.tagName)) {
          background.push({ element: sibling, inert: sibling.inert });
          sibling.inert = true;
        }
      }
      if (branch.parentElement === document.body) break;
      branch = branch.parentElement;
    }
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const controls = () => Array.from(dialog.querySelectorAll<HTMLElement>('button, input, select, textarea, a[href], [tabindex]')).filter((element) => !element.matches(':disabled, [type="hidden"]') && element.tabIndex >= 0 && !element.closest('[inert]') && element.getClientRects().length > 0 && getComputedStyle(element).visibility !== 'hidden');
    (dialog.querySelector<HTMLElement>('[autofocus]') || dialog).focus();
    function key(event: KeyboardEvent) {
      if (dialogs[dialogs.length - 1] !== dialog) return;
      if (event.key === 'Escape') { event.preventDefault(); close.current(); }
      if (event.key !== 'Tab') return;
      const items = controls();
      const first = items[0]; const last = items[items.length - 1];
      if (!items.length) { event.preventDefault(); ref.current?.focus(); }
      else if (event.shiftKey && (document.activeElement === dialog || document.activeElement === first || !ref.current?.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !ref.current?.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    }
    document.addEventListener('keydown', key);
    return () => {
      dialogs.splice(dialogs.indexOf(dialog), 1);
      background.forEach(({ element, inert }) => { element.inert = inert; });
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', key);
      if (previous?.isConnected && !previous.closest('[inert]')) previous.focus();
      else {
        const destination = dialogs[dialogs.length - 1] || document.querySelector<HTMLElement>('main h1, main');
        if (destination && !destination.closest('[inert]')) {
          if (!destination.hasAttribute('tabindex')) destination.tabIndex = -1;
          destination.focus();
        }
      }
    };
  }, []);
  return ref;
}
