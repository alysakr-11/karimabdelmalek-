'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CroppedImage } from './CroppedImage';
import type { Trim } from '@/content/media';

export type LightboxItem = {
  src: string;
  alt: string;
  trim: Trim;
  /** Width over height of the artwork itself, after trimming. */
  ratio: number;
};

const MAX_SCALE = 4;
const STEP = 1.6;
const DOUBLE_TAP_MS = 300;
const TAP_SLOP_PX = 8;

type Point = { x: number; y: number };

/**
 * A work shown on its own, full screen, to look at closely.
 *
 * - Phone: pinch to zoom, double-tap to zoom in or back out, drag to move
 *   around while zoomed. No zoom buttons: the fingers are the controls.
 * - Desktop: the wheel or trackpad zooms toward the pointer, double-click
 *   toggles, drag pans, and + / − / fit buttons sit at the bottom.
 * - Several works: swipe (or the arrows, or ← →) moves between them while
 *   not zoomed in.
 * - Closing: the close button, Escape, or a tap on the dark ground around
 *   the picture.
 *
 * It is a modal dialog: focus moves in and is restored on close, Tab stays
 * inside, and the page behind neither scrolls nor answers keys.
 */
export function Lightbox({
  items,
  index,
  onIndex,
  onClose,
}: {
  items: LightboxItem[];
  index: number;
  onIndex?: (i: number) => void;
  onClose: () => void;
}) {
  const item = items[index];
  const many = items.length > 1 && !!onIndex;

  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const [animate, setAnimate] = useState(false);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  // Live gesture state, read by the handlers without waiting for a render.
  const view = useRef({ scale: 1, pan: { x: 0, y: 0 } });
  const pointers = useRef(new Map<number, Point>());
  const gesture = useRef<{
    start: Point;
    time: number;
    moved: boolean;
    pinch: { dist: number; scale: number; mid: Point; pan: Point } | null;
    last: Point;
  } | null>(null);
  const lastTap = useRef<{ time: number; at: Point } | null>(null);

  const apply = useCallback((s: number, p: Point, smooth: boolean) => {
    const box = boxRef.current;
    const stage = stageRef.current;
    const next = Math.min(MAX_SCALE, Math.max(1, s));
    let x = p.x;
    let y = p.y;
    if (box && stage) {
      // Keep the picture covering the screen once it is bigger than it, and
      // centred while it is smaller.
      const maxX = Math.max(0, (box.offsetWidth * next - stage.clientWidth) / 2);
      const maxY = Math.max(0, (box.offsetHeight * next - stage.clientHeight) / 2);
      x = Math.min(maxX, Math.max(-maxX, x));
      y = Math.min(maxY, Math.max(-maxY, y));
    }
    if (next === 1) {
      x = 0;
      y = 0;
    }
    view.current = { scale: next, pan: { x, y } };
    setAnimate(smooth);
    setScale(next);
    setPan({ x, y });
  }, []);

  /** Zoom to `s`, keeping the point `at` (relative to the stage centre) still. */
  const zoomAt = useCallback(
    (s: number, at: Point, smooth: boolean) => {
      const { scale: from, pan: p } = view.current;
      const to = Math.min(MAX_SCALE, Math.max(1, s));
      const k = to / from;
      apply(to, { x: at.x - (at.x - p.x) * k, y: at.y - (at.y - p.y) * k }, smooth);
    },
    [apply],
  );

  const fromCentre = (clientX: number, clientY: number): Point => {
    const r = stageRef.current!.getBoundingClientRect();
    return { x: clientX - (r.left + r.width / 2), y: clientY - (r.top + r.height / 2) };
  };

  const go = useCallback(
    (step: number) => {
      if (!many || !onIndex) return;
      onIndex((index + step + items.length) % items.length);
    },
    [many, onIndex, index, items.length],
  );

  // A new work always opens fitted.
  useLayoutEffect(() => {
    apply(1, { x: 0, y: 0 }, false);
  }, [index, apply]);

  // The latest handlers, so the modal set-up below runs once per opening and
  // focus is not bounced around each time the work changes.
  const latest = useRef({ onClose, zoomAt, apply, go });
  latest.current = { onClose, zoomAt, apply, go };

  // Modal behaviour: focus in and back, no scrolling behind, keys.
  useEffect(() => {
    const restore = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      const { onClose, zoomAt, apply, go } = latest.current;
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === '+' || e.key === '=') {
        zoomAt(view.current.scale * STEP, { x: 0, y: 0 }, true);
      } else if (e.key === '-' || e.key === '_') {
        zoomAt(view.current.scale / STEP, { x: 0, y: 0 }, true);
      } else if (e.key === '0') {
        apply(1, { x: 0, y: 0 }, true);
      } else if (e.key === 'ArrowLeft' && view.current.scale === 1) {
        go(-1);
      } else if (e.key === 'ArrowRight' && view.current.scale === 1) {
        go(1);
      } else if (e.key === 'Tab' && dialogRef.current) {
        const stops = [...dialogRef.current.querySelectorAll<HTMLElement>('button')].filter(
          (b) => b.getClientRects().length > 0,
        );
        if (stops.length === 0) return;
        const i = stops.indexOf(document.activeElement as HTMLElement);
        e.preventDefault();
        stops[(i + (e.shiftKey ? -1 : 1) + stops.length) % stops.length].focus();
      } else {
        return;
      }
      // Handled here: the page behind (a work's own arrow keys) must not act too.
      e.stopPropagation();
    };
    // Capture, so this runs before the page's own key handlers.
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      document.body.style.overflow = overflow;
      restore?.focus?.();
    };
  }, []);

  // The wheel needs a non-passive listener to stop the page scrolling.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0025));
      zoomAt(view.current.scale * factor, fromCentre(e.clientX, e.clientY), false);
    };
    stage.addEventListener('wheel', onWheel, { passive: false });
    return () => stage.removeEventListener('wheel', onWheel);
  }, [zoomAt]);

  useEffect(() => {
    const onResize = () => apply(view.current.scale, view.current.pan, false);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [apply]);

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    try {
      stageRef.current?.setPointerCapture(e.pointerId);
    } catch {
      // Not every pointer can be captured (a synthetic one, say); the
      // gesture still works without it, just not beyond the stage's edge.
    }
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    if (pts.length === 1) {
      gesture.current = {
        start: { x: e.clientX, y: e.clientY },
        time: performance.now(),
        moved: false,
        pinch: null,
        last: { x: e.clientX, y: e.clientY },
      };
    } else if (pts.length === 2 && gesture.current) {
      const [a, b] = pts;
      gesture.current.moved = true;
      gesture.current.pinch = {
        dist: Math.hypot(a.x - b.x, a.y - b.y) || 1,
        scale: view.current.scale,
        mid: fromCentre((a.x + b.x) / 2, (a.y + b.y) / 2),
        pan: { ...view.current.pan },
      };
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId) || !gesture.current) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    const pts = [...pointers.current.values()];

    if (g.pinch && pts.length >= 2) {
      const [a, b] = pts;
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const mid = fromCentre((a.x + b.x) / 2, (a.y + b.y) / 2);
      const to = Math.min(MAX_SCALE, Math.max(1, (g.pinch.scale * dist) / g.pinch.dist));
      const k = to / g.pinch.scale;
      // Zoom about where the fingers started, and follow them as they move.
      apply(
        to,
        {
          x: g.pinch.mid.x - (g.pinch.mid.x - g.pinch.pan.x) * k + (mid.x - g.pinch.mid.x),
          y: g.pinch.mid.y - (g.pinch.mid.y - g.pinch.pan.y) * k + (mid.y - g.pinch.mid.y),
        },
        false,
      );
      return;
    }

    if (Math.hypot(e.clientX - g.start.x, e.clientY - g.start.y) > TAP_SLOP_PX) g.moved = true;
    if (view.current.scale > 1) {
      const p = view.current.pan;
      apply(view.current.scale, { x: p.x + e.clientX - g.last.x, y: p.y + e.clientY - g.last.y }, false);
    }
    g.last = { x: e.clientX, y: e.clientY };
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.delete(e.pointerId);
    const g = gesture.current;
    if (!g) return;
    if (pointers.current.size > 0) {
      // One finger of a pinch lifted: carry on panning with the other.
      const [rest] = [...pointers.current.values()];
      g.pinch = null;
      g.last = rest;
      return;
    }
    gesture.current = null;

    const dx = e.clientX - g.start.x;
    const dy = e.clientY - g.start.y;

    // A sideways swipe at fit size moves to the next or previous work.
    if (g.moved && !g.pinch && view.current.scale === 1 && many) {
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.2) go(dx < 0 ? 1 : -1);
      return;
    }
    if (g.moved || performance.now() - g.time > 500) return;

    // A tap.
    const at = fromCentre(e.clientX, e.clientY);
    // By position, not by event target: the stage captures the pointer, so
    // every event reports the stage as its target.
    const r = boxRef.current?.getBoundingClientRect();
    const onPicture =
      !!r && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    const prev = lastTap.current;
    if (
      onPicture &&
      prev &&
      performance.now() - prev.time < DOUBLE_TAP_MS &&
      Math.hypot(at.x - prev.at.x, at.y - prev.at.y) < 30
    ) {
      lastTap.current = null;
      if (view.current.scale > 1) apply(1, { x: 0, y: 0 }, true);
      else zoomAt(2.5, at, true);
      return;
    }
    lastTap.current = { time: performance.now(), at };
    if (!onPicture && view.current.scale === 1) onClose();
  };

  const onPointerCancel = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size === 0) gesture.current = null;
  };

  const round =
    'flex h-11 w-11 items-center justify-center rounded-full border border-chalk/30 bg-umber-deep/60 text-chalk backdrop-blur-sm transition-colors duration-300 hover:border-chalk hover:bg-chalk hover:text-umber-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ochre-lift disabled:pointer-events-none disabled:opacity-30';

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-hidden="false"
      aria-label={item.alt}
      data-lenis-prevent
      className="fixed inset-0 z-[70] bg-[#0d0a07] text-chalk"
    >
      <div
        ref={stageRef}
        className={`absolute inset-0 flex items-center justify-center overflow-hidden ${
          scale > 1 ? 'cursor-grab active:cursor-grabbing' : ''
        }`}
        style={{ touchAction: 'none' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      >
        <div
          ref={boxRef}
          // Where a mouse is in use, leave room under the picture for the zoom
          // buttons; on a touch screen the picture can take the height.
          className={`relative select-none [--fit-h:86dvh] [@media(hover:hover)]:[--fit-h:78dvh] ${
            scale === 1 ? 'cursor-zoom-in' : ''
          }`}
          style={{
            aspectRatio: `${item.ratio}`,
            width: `min(94vw, calc(var(--fit-h) * ${item.ratio}))`,
            transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${scale})`,
            transition: animate ? 'transform 280ms cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
            willChange: 'transform',
          }}
          onDragStart={(e) => e.preventDefault()}
        >
          {/* The size the page already loaded shows at once; the sharp one,
              as wide as the file allows for zooming in, lands over it. */}
          <div className="absolute inset-0" aria-hidden>
            <CroppedImage
              key={`${item.src}-base`}
              src={item.src}
              alt=""
              trim={item.trim}
              sizes="(max-width: 1024px) 94vw, 64vw"
            />
          </div>
          <div className="absolute inset-0">
            <CroppedImage
              key={item.src}
              src={item.src}
              alt={item.alt}
              trim={item.trim}
              priority
              sizes="(max-width: 1024px) 300vw, 150vw"
            />
          </div>
        </div>
      </div>

      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="Close"
        className={`${round} absolute top-4 right-4 sm:top-6 sm:right-6`}
      >
        <svg aria-hidden viewBox="0 0 14 14" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round">
          <path d="M2.5 2.5l9 9M11.5 2.5l-9 9" />
        </svg>
      </button>

      {many ? (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous work"
            className={`${round} absolute top-1/2 left-3 -translate-y-1/2 sm:left-6 [@media(hover:none)]:hidden`}
          >
            <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 3.5 5.5 8l4.5 4.5" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next work"
            className={`${round} absolute top-1/2 right-3 -translate-y-1/2 sm:right-6 [@media(hover:none)]:hidden`}
          >
            <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 3.5 10.5 8 6 12.5" />
            </svg>
          </button>
        </>
      ) : null}

      {/* Zoom buttons for a mouse; on a touch screen the fingers do this. */}
      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 sm:bottom-7 [@media(hover:none)]:hidden">
        <button
          type="button"
          onClick={() => zoomAt(view.current.scale / STEP, { x: 0, y: 0 }, true)}
          disabled={scale <= 1}
          aria-label="Zoom out"
          className={round}
        >
          <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
            <path d="M3.5 8h9" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => apply(1, { x: 0, y: 0 }, true)}
          disabled={scale <= 1}
          className="t-eyebrow h-11 rounded-full border border-chalk/30 bg-umber-deep/60 px-5 text-chalk backdrop-blur-sm transition-colors duration-300 hover:border-chalk hover:bg-chalk hover:text-umber-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ochre-lift disabled:pointer-events-none disabled:opacity-30"
        >
          Fit
        </button>
        <button
          type="button"
          onClick={() => zoomAt(view.current.scale * STEP, { x: 0, y: 0 }, true)}
          disabled={scale >= MAX_SCALE}
          aria-label="Zoom in"
          className={round}
        >
          <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
            <path d="M3.5 8h9M8 3.5v9" />
          </svg>
        </button>
      </div>
    </div>,
    document.body,
  );
}
