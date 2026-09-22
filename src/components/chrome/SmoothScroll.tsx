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
      const el = document.querySelector(id);
      if (!el) return;
      event.preventDefault();
      lenis.scrollTo(el as HTMLElement, { offset: -88 });
      // preventDefault() also cancels the browser moving focus to the target,
      // which is the whole point of a skip link: "Skip to content" scrolled
      // nowhere (main is already at the top), focus stayed on the link, and
      // the next Tab went straight back into the header. Move it by hand.
      // Lenis owns the scroll, so the focus must not trigger one of its own.
      const focusable = el as HTMLElement;
      if (!focusable.hasAttribute('tabindex') && focusable.tabIndex < 0) {
        focusable.setAttribute('tabindex', '-1');
      }
      focusable.focus({ preventScroll: true });
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
