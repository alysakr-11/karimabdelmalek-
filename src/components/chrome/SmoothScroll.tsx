'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { useReducedMotion } from '@/lib/useReducedMotion';

/**
 * Inertial scrolling for the whole document.
 *
 * Skipped entirely when the OS asks for reduced motion, and torn down on
 * unmount so native scrolling is always restored. Anchor links are handled by
 * Lenis so in-page navigation keeps the same easing as the wheel.
 */
export function SmoothScroll() {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    // Coarse pointers already have momentum scrolling from the OS; layering
    // Lenis on top of it feels laggy, so leave touch alone.
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    const onAnchorClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement | null)?.closest('a[href^="#"]');
      if (!(target instanceof HTMLAnchorElement)) return;
      const id = target.getAttribute('href');
      if (!id || id === '#') return;
      const el = document.querySelector<HTMLElement>(id);
      if (!el) return;
      event.preventDefault();
      lenis.scrollTo(el, { offset: -88 });

      // Preventing the default jump also cancels everything the browser would
      // otherwise do for a fragment link: the hash is not written, and focus
      // stays on the anchor. For the skip link that is the whole feature — a
      // keyboard user would activate it and find their next Tab back in the
      // header. So do both by hand.
      history.pushState(null, '', id);
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
      el.focus({ preventScroll: true });
    };

    document.addEventListener('click', onAnchorClick);

    return () => {
      document.removeEventListener('click', onAnchorClick);
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, [reduced]);

  return null;
}
