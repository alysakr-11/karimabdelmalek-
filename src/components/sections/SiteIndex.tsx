'use client';

import Link from 'next/link';
import { useState } from 'react';
import { NotchedFrame } from '@/components/primitives/NotchedFrame';
import { CroppedImage } from '@/components/primitives/CroppedImage';
import { CurveDivider } from '@/components/primitives/CurveDivider';
import { ContourField } from '@/components/primitives/ContourField';
import { SectionHeading } from '@/components/primitives/SectionHeading';
import { Reveal } from '@/components/primitives/Reveal';
import { FULL_TRIM, type Trim } from '@/content/media';
import { exhibitions, totalArtworks } from '@/content/exhibitions';
import { illustrations } from '@/content/illustrations';
import { interviews } from '@/content/interviews';
import { artist } from '@/content/artist';
import { contact } from '@/content/contact';

/**
 * The way into the site.
 *
 * Each part of the archive lives on its own page and appears nowhere else, so
 * the home page's job is to name those pages and get you to them — not to
 * preview them. Anything shown twice would make the home page a long scroll
 * through content the reader then meets again, which is exactly what this
 * replaces.
 */

type Room = {
  href: string;
  index: string;
  title: string;
  meta: string;
  body: string;
  image?: { src: string; trim: Trim; alt: string };
  /** Column span on wide screens; the aspect ratio is derived from it so the
   *  two cards in a row end up exactly the same height. */
  span: 5 | 7 | 12;
};

const cover = exhibitions[0]?.cover;

const ROOMS: Room[] = [
  {
    href: '/exhibitions',
    index: '01',
    title: 'Exhibitions',
    meta: `${exhibitions.length} galleries`,
    body: `Six solo shows at Safarkhan in Cairo, the Caravan festival, and a wider collection — ${totalArtworks} works, each with a page of its own.`,
    image: cover
      ? { src: cover.src, trim: cover.trim, alt: `From ${exhibitions[0].title}` }
      : undefined,
    span: 7,
  },
  {
    href: '/illustrations',
    index: '02',
    title: 'Illustrations',
    meta: `${illustrations.length} works`,
    body: 'Watercolours made for the press, printed rather than hung.',
    image: illustrations[0]
      ? { src: illustrations[0].src, trim: FULL_TRIM, alt: 'An illustration' }
      : undefined,
    span: 5,
  },
  {
    href: '/interviews',
    index: '03',
    title: 'Interviews',
    meta: `${interviews.length} appearances`,
    body: 'Television appearances on Al Nahar, DMC, ON and Channel 1.',
    image: interviews[0]
      ? { src: interviews[0].poster, trim: FULL_TRIM, alt: interviews[0].channel }
      : undefined,
    span: 5,
  },
  {
    href: '/about',
    index: '04',
    title: 'About',
    meta: 'Biography and CV',
    body: 'Trained in graphics at the Faculty of Fine Arts in Minia; exhibiting in Cairo since 2001.',
    image: { src: artist.portrait, trim: FULL_TRIM, alt: `${artist.name}, portrait` },
    span: 7,
  },
];

/** Wide screens lay the rooms out 7+5 and 5+7; the aspect ratio is tied to the
 *  span so both cards in a row resolve to the same height. */
const SPAN_CLASS: Record<Room['span'], string> = {
  5: 'lg:col-span-5 lg:aspect-[5/4]',
  7: 'lg:col-span-7 lg:aspect-[7/4]',
  12: 'lg:col-span-12',
};

function RoomCard({ room, priority }: { room: Room; priority: boolean }) {
  const [active, setActive] = useState(false);

  return (
    <Link
      href={room.href}
      className={`group block aspect-[4/3] ${SPAN_CLASS[room.span]}`}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
    >
      <NotchedFrame
        active={active}
        tabWidth={250}
        stroke="rgba(245,241,233,0.16)"
        strokeActive="var(--color-ochre-lift)"
        className="h-full w-full"
        caption={
          <span className="flex w-full items-baseline justify-end gap-2.5 truncate">
            <span className="t-caption truncate text-chalk">{room.title}</span>
            <span className="t-caption shrink-0 text-ochre-lift">{room.meta}</span>
          </span>
        }
      >
        <div className="relative h-full w-full bg-umber-deep" style={{ paddingBottom: 38 }}>
          {room.image ? (
            <CroppedImage
              src={room.image.src}
              alt=""
              trim={room.image.trim}
              priority={priority}
              sizes="(max-width: 1024px) 92vw, 48vw"
              imgClassName="transition-transform duration-[1100ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
            />
          ) : null}

          {/* The type has to stay readable over whatever the picture is doing,
              so the scrim is part of the card rather than a property of the
              image. */}
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 bottom-[38px] bg-gradient-to-t from-umber-deep via-umber-deep/55 to-umber-deep/5"
          />

          {/* Stops at the tab's top edge — running to inset-0 slid the
              "Open" line underneath the caption and clipped it. */}
          <div className="absolute inset-x-0 top-0 bottom-[38px] flex flex-col justify-end p-6 sm:p-8">
            <p className="t-eyebrow mb-3 text-ochre-lift">{room.index}</p>
            <h3 className="t-display text-[clamp(1.75rem,1.1rem+2.4vw,3.25rem)] leading-[0.95] text-chalk">
              {room.title}
            </h3>
            <p className="t-body mt-3 max-w-[42ch] text-sm text-chalk/70">{room.body}</p>
            <span className="t-eyebrow mt-5 inline-flex items-center gap-2 text-chalk/55 transition-colors group-hover:text-ochre-lift">
              Open
              <svg
                aria-hidden
                viewBox="0 0 14 14"
                className="h-3 w-3 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 11 11 3M5 3h6v6" />
              </svg>
            </span>
          </div>
        </div>
      </NotchedFrame>
    </Link>
  );
}

/** Contact gets no photograph: the row reads better broken by a flat accent
 *  panel, and the number is the thing worth showing. */
function ContactRoom() {
  return (
    <Link
      href="/contact"
      className="group block lg:col-span-12"
      aria-label="Contact — enquiries, commissions and gallery visits"
    >
      <div className="relative overflow-hidden rounded-2xl border border-ochre/35 bg-ochre/10 p-8 transition-colors duration-500 group-hover:border-ochre-lift/70 sm:p-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="t-eyebrow mb-3 text-ochre-lift">05</p>
            <h3 className="t-display text-[clamp(1.75rem,1.1rem+2.4vw,3.25rem)] leading-[0.95] text-chalk">
              Contact
            </h3>
            <p className="t-body mt-3 max-w-[46ch] text-sm text-chalk/70">
              Enquiries about a work, commissions, and gallery visits.
            </p>
          </div>

          <div className="md:text-right">
            <p className="t-display text-[clamp(1.25rem,0.9rem+1.4vw,2rem)] text-ochre-lift">
              {contact.phoneDisplay}
            </p>
            <span className="t-eyebrow mt-3 inline-flex items-center gap-2 text-chalk/55 transition-colors group-hover:text-ochre-lift">
              Send a message
              <svg
                aria-hidden
                viewBox="0 0 14 14"
                className="h-3 w-3 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 11 11 3M5 3h6v6" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function SiteIndex() {
  return (
    <section id="explore" data-nav-theme="dark" className="on-dark relative">
      <CurveDivider
        fill="var(--color-umber-deep)"
        behind="var(--color-paper)"
        className="-mb-px"
        height={80}
      />

      <div className="relative overflow-hidden bg-umber-deep py-16 sm:py-20 lg:py-28">
        <ContourField seed={41} opacity={0.34} stroke="var(--color-ochre-lift)" />

        <div className="shell relative">
          <SectionHeading
            eyebrow="Explore"
            lead="Five"
            trail="rooms"
            dark
            body="Each part of the archive has a page of its own. Nothing here is a preview of something further down."
          />

          <Reveal className="mt-12 sm:mt-16">
            <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-12">
              {ROOMS.map((room, i) => (
                <RoomCard key={room.href} room={room} priority={i < 2} />
              ))}
              <ContactRoom />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
