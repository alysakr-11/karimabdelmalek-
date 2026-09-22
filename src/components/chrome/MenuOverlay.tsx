'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { NAV_LINKS } from './nav';
import { socials } from '@/content/site';
import { exhibitions } from '@/content/exhibitions';
import { PhoneActions } from '@/components/primitives/PhoneActions';
import { ContourField } from '@/components/primitives/ContourField';

/**
 * Full-screen navigation.
 *
 * NOTE ON FIDELITY: the reference site's menu-open animation is not visible in
 * the supplied recording, so this is not a reproduction of it. It is an
 * original transition built to match the rest of the design language — a
 * ground-up wipe with the links rising on a stagger.
 *
 * Accessibility: rendered as a modal dialog, focus is moved in and restored on
 * close, Escape dismisses, and background scrolling is locked while open.
 */
export function MenuOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const restoreTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    restoreTo.current = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>('a, button')?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !panel) return;

      // Keep focus inside the dialog.
      const focusable = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflow;
      restoreTo.current?.focus();
    };
  }, [open, onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Site navigation"
      aria-hidden={!open}
      // `inert` keeps the closed menu out of the tab order without unmounting
      // it, so the open/close transition can still run.
      inert={!open}
      className={`on-dark fixed inset-0 z-50 bg-umber-deep transition-[clip-path,opacity] duration-[900ms] ease-[var(--ease-in-out-quint)] ${
        open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      }`}
      style={{
        clipPath: open ? 'inset(0% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)',
      }}
    >
      <ContourField seed={21} opacity={0.5} stroke="var(--color-ochre-lift)" />

      <div ref={panelRef} className="shell relative flex h-full flex-col justify-between py-6">
        <div className="flex items-start justify-end">
          <button
            type="button"
            onClick={onClose}
            className="t-eyebrow flex items-center gap-3 rounded-full border border-chalk/25 px-5 py-3 text-chalk transition-colors duration-300 hover:border-chalk hover:bg-chalk hover:text-umber-deep"
          >
            Close
            <svg aria-hidden viewBox="0 0 14 14" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
              <path d="M2 2l10 10M12 2L2 12" />
            </svg>
          </button>
        </div>

        <nav aria-label="Primary" className="flex-1 overflow-y-auto py-8">
          <ul className="flex flex-col gap-1 sm:gap-2">
            {NAV_LINKS.map((link, i) => (
              <li key={link.href} className="overflow-hidden">
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="t-display group flex items-baseline gap-4 py-1 text-[clamp(1.75rem,0.25rem+7.5vw,6rem)] text-chalk transition-colors duration-300 hover:text-ochre-lift"
                  style={{
                    transform: open ? 'none' : 'translate3d(0,110%,0)',
                    transition: `transform 900ms var(--ease-out-expo) ${open ? 120 + i * 70 : 0}ms`,
                  }}
                >
                  <span className="t-eyebrow text-[0.625rem] text-ochre-lift opacity-60">
                    0{i + 1}
                  </span>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="grid gap-6 border-t border-chalk/12 pt-6 sm:grid-cols-3">
          <div>
            <p className="t-eyebrow mb-3 text-chalk/40">Exhibitions</p>
            <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
              {exhibitions.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/exhibitions/${c.slug}`}
                    onClick={onClose}
                    className="t-caption text-chalk/70 transition-colors hover:text-ochre-lift"
                  >
                    {c.title}{c.year ? <span className="text-chalk/35"> {c.year}</span> : null}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="t-eyebrow mb-3 text-chalk/40">Get in touch</p>
            <PhoneActions
              tone="dark"
              numberClassName="t-caption text-chalk/70 hover:text-ochre-lift"
            />
          </div>
          <div>
            <p className="t-eyebrow mb-3 text-chalk/40">Elsewhere</p>
            <ul className="flex flex-wrap gap-4">
              {socials.map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="t-caption text-chalk/70 transition-colors hover:text-ochre-lift"
                  >
                    {s.platform}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
