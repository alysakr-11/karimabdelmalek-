'use client';

import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
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
 * Exhibitions opens in place into the list of shows, with a link to the full
 * index underneath, rather than taking a visitor to a page just to choose.
 *
 * Accessibility: rendered as a modal dialog, focus is moved in and restored on
 * close, Escape dismisses, and background scrolling is locked while open. The
 * exhibitions list is a disclosure: a real button with `aria-expanded`, and
 * `inert` while collapsed so its links are out of the tab order.
 */
export function MenuOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const restoreTo = useRef<HTMLElement | null>(null);
  const [showsOpen, setShowsOpen] = useState(false);
  const showsId = useId();

  // Each time the menu opens, it opens with the list folded away.
  useEffect(() => {
    if (!open) setShowsOpen(false);
  }, [open]);

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

      // Keep focus inside the dialog. Links in the folded exhibitions list are
      // inert, and one of its two copies is always hidden by the layout, so
      // neither can be the first or last stop.
      const focusable = [
        ...panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
      ].filter((el) => !el.closest('[inert]') && el.getClientRects().length > 0);
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

        <nav
          aria-label="Primary"
          className="flex-1 overflow-y-auto py-8 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-start lg:gap-16"
        >
          <ul className="flex flex-col gap-1 sm:gap-2">
            {NAV_LINKS.map((link, i) => {
              const motion = {
                transform: open ? 'none' : 'translate3d(0,110%,0)',
                transition: `transform 900ms var(--ease-out-expo) ${open ? 120 + i * 70 : 0}ms`,
              };
              const big =
                't-display py-1 text-[clamp(1.75rem,0.25rem+7.5vw,6rem)] text-chalk transition-colors duration-300 hover:text-ochre-lift';

              if (link.href !== '/exhibitions') {
                return (
                  <li key={link.href} className="overflow-hidden">
                    <Link href={link.href} onClick={onClose} className={`${big} block`} style={motion}>
                      {link.label}
                    </Link>
                  </li>
                );
              }

              return (
                <li key={link.href}>
                  <div className="overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setShowsOpen((v) => !v)}
                      aria-expanded={showsOpen}
                      aria-controls={`${showsId}-inline ${showsId}-side`}
                      className={`${big} flex w-full items-center gap-4 text-left sm:gap-6 ${showsOpen ? 'text-ochre-lift' : ''}`}
                      style={motion}
                    >
                      {link.label}
                      <svg
                        aria-hidden
                        viewBox="0 0 24 24"
                        className={`h-[0.5em] w-[0.5em] shrink-0 transition-transform duration-500 ease-[var(--ease-out-expo)] ${
                          showsOpen ? 'rotate-180 lg:-rotate-90' : 'lg:-rotate-90'
                        }`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 9l7 7 7-7" />
                      </svg>
                    </button>
                  </div>

                  {/* Phones and tablets: the list opens in place, pushing the
                      links below it down. Grid rows animate from 0 to its own
                      height. */}
                  <div
                    id={`${showsId}-inline`}
                    inert={!showsOpen}
                    className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[var(--ease-out-expo)] lg:hidden ${
                      showsOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <ShowsList
                        onNavigate={onClose}
                        className="max-w-3xl pt-3 pb-6 sm:pt-4 sm:pb-8"
                        listClassName="sm:grid-cols-2"
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Desktop: the list opens beside the links, so nothing moves. */}
          <div
            id={`${showsId}-side`}
            inert={!showsOpen}
            className={`hidden transition-[opacity,transform] duration-500 ease-[var(--ease-out-expo)] lg:block lg:pt-4 ${
              showsOpen ? 'translate-x-0 opacity-100' : 'pointer-events-none translate-x-4 opacity-0'
            }`}
          >
            <p className="t-eyebrow mb-2 text-chalk/40">Exhibitions</p>
            <ShowsList onNavigate={onClose} />
          </div>
        </nav>

        <div className="grid gap-6 border-t border-chalk/12 pt-6 sm:grid-cols-2">
          <div>
            <p className="t-eyebrow mb-3 text-chalk/40">Get in touch</p>
            <PhoneActions tone="dark" showNumber={false} />
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

/** Every exhibition with its year, then the index of them all. */
function ShowsList({
  onNavigate,
  className = '',
  listClassName = '',
}: {
  onNavigate: () => void;
  className?: string;
  listClassName?: string;
}) {
  return (
    <div className={className}>
      <ul className={`grid gap-x-10 ${listClassName}`}>
        {exhibitions.map((c) => (
          <li key={c.slug} className="border-b border-chalk/10">
            <Link
              href={`/exhibitions/${c.slug}`}
              onClick={onNavigate}
              className="group/show flex items-baseline justify-between gap-4 py-3 text-chalk/85 transition-colors duration-300 hover:text-ochre-lift"
            >
              <span className="t-serif text-xl sm:text-2xl">{c.title}</span>
              {c.year ? (
                <span className="t-eyebrow text-chalk/40 tabular-nums transition-colors group-hover/show:text-ochre-lift">
                  {c.year}
                </span>
              ) : null}
            </Link>
          </li>
        ))}
        {/* The index of every gallery, as the last row of the list rather
            than a separate button. Not the same as "Collection", which is one
            gallery of its own. */}
        <li className="border-b border-chalk/10">
          <Link
            href="/exhibitions"
            onClick={onNavigate}
            className="group/show flex items-baseline justify-between gap-4 py-3 text-chalk transition-colors duration-300 hover:text-ochre-lift"
          >
            <span className="t-serif text-xl sm:text-2xl">All exhibitions</span>
            <svg
              aria-hidden
              viewBox="0 0 16 16"
              className="h-3.5 w-3.5 self-center text-ochre-lift transition-transform duration-300 group-hover/show:translate-x-1"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </Link>
        </li>
      </ul>
    </div>
  );
}
