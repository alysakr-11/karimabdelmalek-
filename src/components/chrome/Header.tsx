'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { MenuOverlay } from './MenuOverlay';
import { LOGOTYPE, SITE_NAME } from '@/content/site';

/**
 * Fixed header: stacked logotype at the left, a primary action and the menu
 * trigger at the right.
 *
 * The logotype and menu button invert as the page passes over a dark section.
 * Sections opt in by setting `data-nav-theme="dark"`; a rAF-throttled scroll
 * listener checks which one sits under the header line.
 *
 * At the top of a page the header is bare. Once the page scrolls, a frosted
 * bar in the section's own tone fades in behind it, so the logotype never sits
 * on top of a heading, a painting or a button scrolling underneath.
 */
export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [onDark, setOnDark] = useState(false);
  const [lifted, setLifted] = useState(false);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      setLifted(window.scrollY > 24);

      // The y-line the logotype sits on.
      const probe = 42;
      const sections = document.querySelectorAll<HTMLElement>('[data-nav-theme]');
      let dark = false;
      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= probe && rect.bottom >= probe) {
          dark = section.dataset.navTheme === 'dark';
        }
      }
      setOnDark(dark);
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const inverted = onDark && !menuOpen;

  return (
    <>
      <a
        href="#main"
        className="t-eyebrow sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-chalk"
      >
        Skip to content
      </a>

      {/* While bare, the header lets taps through to the page around its
          controls; once the bar is showing, the bar itself takes them, so a tap
          on it never lands on something hidden underneath. */}
      <header
        className={`fixed inset-x-0 top-0 z-40 ${lifted && !menuOpen ? '' : 'pointer-events-none'}`}
      >
        <div
          aria-hidden
          className={`absolute inset-0 border-b backdrop-blur-md transition-[opacity,background-color,border-color] duration-500 ${
            lifted && !menuOpen ? 'opacity-100' : 'opacity-0'
          } ${inverted ? 'border-chalk/10 bg-umber-deep/90' : 'border-ink/10 bg-paper/92'}`}
        />
        <div className="shell relative flex items-start justify-between py-4 sm:py-5">
          <Link
            href="/"
            aria-label={`${SITE_NAME} — home`}
            className={`pointer-events-auto t-display text-[0.9375rem] leading-[0.92] transition-colors duration-500 sm:text-[1.0625rem] ${
              inverted ? 'text-chalk' : 'text-ink'
            }`}
          >
            {LOGOTYPE.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </Link>

          <div className="pointer-events-auto flex items-center gap-2 sm:gap-2.5">
            <Link
              href="/contact"
              className={`t-eyebrow hidden items-center gap-2 rounded-full px-5 py-3 transition-all duration-500 sm:inline-flex ${
                lifted ? 'shadow-[0_6px_24px_-12px_rgba(22,18,13,0.5)]' : ''
              } bg-ochre text-chalk hover:bg-clay`}
            >
              Enquire
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={menuOpen}
              className={`flex h-[46px] w-[46px] items-center justify-center rounded-[13px] border transition-colors duration-500 ${
                inverted
                  ? 'border-chalk/30 bg-umber-deep/60 text-chalk hover:bg-chalk hover:text-umber-deep'
                  : 'border-ink/20 bg-paper/70 text-ink hover:bg-ink hover:text-paper'
              } backdrop-blur-sm`}
            >
              <svg aria-hidden viewBox="0 0 18 12" className="h-3 w-[18px]" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round">
                <path d="M1 1.5h16M1 10.5h10" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <MenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
