import type { Metadata } from 'next';
import Image from 'next/image';
import { interviews, playableCount } from '@/content/interviews';
import { socials } from '@/content/site';
import { PageHeader } from '@/components/sections/PageHeader';
import { Reveal } from '@/components/primitives/Reveal';
import { NotchedFrame } from '@/components/primitives/NotchedFrame';
import { ContourField } from '@/components/primitives/ContourField';
import { CurveDivider } from '@/components/primitives/CurveDivider';
import { ContactCta } from '@/components/sections/ContactCta';

export const metadata: Metadata = {
  title: 'Interviews',
  description:
    'Television interviews with Karim Abd Elmalak on Al Nahar TV, DMC TV, Channel 1 Egyptian TV and ON TV.',
  alternates: { canonical: '/interviews' },
};

export default function InterviewsPage() {
  const youtube = socials.find((s) => s.platform === 'YouTube');

  return (
    <>
      <PageHeader
        eyebrow="Press"
        lead="Interviews"
        seed={47}
        body={
          playableCount > 0
            ? `${interviews.length} television appearances. ${playableCount} of them can be watched; the rest were embedded with a player that did not survive the move, so those are the programme stills.`
            : `${interviews.length} television appearances. The original broadcasts were embedded with a player that did not survive the move, so these are the programme stills.`
        }
      />

      <CurveDivider fill="var(--color-umber-deep)" className="-mb-px" height={72} />

      <section
        data-nav-theme="dark"
        className="on-dark relative overflow-hidden bg-umber-deep py-12 sm:py-16 lg:py-20"
      >
        <ContourField seed={83} opacity={0.32} stroke="var(--color-ochre-lift)" />

        <div className="shell relative">
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {interviews.map((interview, i) => {
              const body = (
                <NotchedFrame
                  tabWidth={150}
                  stroke="rgba(245,241,233,0.14)"
                  className="aspect-[16/10] w-full"
                  caption={
                    <span className="flex w-full items-baseline justify-end gap-2.5">
                      <span className="t-caption truncate text-chalk">{interview.channel}</span>
                      <span className="t-caption shrink-0 text-ochre-lift">
                        {String(interview.order).padStart(2, '0')}
                      </span>
                    </span>
                  }
                >
                  <div className="relative h-full w-full bg-umber" style={{ paddingBottom: 38 }}>
                    <div className="relative h-full w-full overflow-hidden">
                      <Image
                        src={interview.poster}
                        alt={`${interview.channel} interview still`}
                        fill
                        priority={i < 3}
                        sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 31vw"
                        className="object-cover object-center transition-transform duration-[1100ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
                      />

                      {/* A still that plays has to look like one. Without this the
                          card is indistinguishable from the four that cannot be
                          watched, so nobody thinks to click it. */}
                      {interview.videoUrl ? (
                        <span
                          aria-hidden
                          className="pointer-events-none absolute inset-0 flex items-center justify-center"
                        >
                          <span className="absolute inset-0 bg-umber-deep/25 transition-colors duration-500 group-hover:bg-umber-deep/10" />
                          <span className="relative flex h-14 w-14 items-center justify-center rounded-full border border-chalk/70 bg-umber-deep/55 backdrop-blur-sm transition-all duration-500 group-hover:scale-110 group-hover:border-ochre-lift group-hover:bg-ochre-lift group-focus-visible:scale-110">
                            <svg
                              viewBox="0 0 16 18"
                              className="ml-0.5 h-4 w-4 fill-chalk transition-colors duration-500 group-hover:fill-umber-deep"
                            >
                              <path d="M1 1.8v14.4a1 1 0 0 0 1.52.85l11.6-7.2a1 1 0 0 0 0-1.7L2.52.95A1 1 0 0 0 1 1.8Z" />
                            </svg>
                          </span>
                        </span>
                      ) : null}
                    </div>
                  </div>
                </NotchedFrame>
              );

              return (
                <Reveal as="li" key={interview.order} delay={(i % 3) * 70}>
                  {/* Only render a link when there is something to play — a dead
                      play button would be worse than none. */}
                  {interview.videoUrl ? (
                    <a
                      href={interview.videoUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={`Watch ${
                        interview.programme ? `${interview.programme}, ` : ''
                      }${interview.channel} — opens on YouTube`}
                      className="group block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ochre-lift"
                    >
                      {body}
                    </a>
                  ) : (
                    body
                  )}

                  <div className="mt-4">
                    <p className="t-serif text-xl text-chalk">
                      {interview.programme ?? interview.channel}
                    </p>
                    {interview.programme ? (
                      <p className="t-caption mt-1 font-normal text-chalk/60">
                        {interview.channel}
                        {interview.programmeArabic ? (
                          <>
                            {' · '}
                            <span lang="ar" dir="rtl">
                              {interview.programmeArabic}
                            </span>
                          </>
                        ) : null}
                      </p>
                    ) : null}
                    {interview.presenters.length > 0 ? (
                      <p className="t-caption mt-1 font-normal text-chalk/60">
                        with {interview.presenters.join(' & ')}
                      </p>
                    ) : null}
                    <p className="t-caption mt-2 font-normal text-chalk/40">
                      {interview.videoUrl
                        ? `Watch on YouTube${interview.date ? ` · ${interview.date}` : ''}`
                        : (interview.date ?? 'Recording not yet linked')}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </ul>

          {youtube ? (
            <Reveal className="mt-14">
              <div className="rounded-2xl border border-ochre-lift/25 bg-ochre-lift/5 p-6">
                <p className="t-eyebrow mb-3 text-ochre-lift">Looking for the rest?</p>
                <p className="t-body max-w-[60ch] text-sm text-chalk/70">
                  {playableCount === interviews.length
                    ? 'The artist\u2019s own channel carries his published video.'
                    : `Only ${playableCount} of these ${interviews.length} broadcasts is published anywhere we can find. The rest survive here as programme stills. The artist\u2019s own channel carries what he has put up.`}
                </p>
                <a
                  href={youtube.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="t-eyebrow mt-5 inline-flex items-center gap-2.5 rounded-full border border-chalk/30 px-5 py-3 text-chalk transition-colors hover:border-chalk hover:bg-chalk hover:text-umber-deep"
                >
                  Open YouTube channel
                </a>
              </div>
            </Reveal>
          ) : null}
        </div>
      </section>

      <CurveDivider fill="var(--color-umber-deep)" flip className="-mt-px" height={72} />

      <ContactCta />
    </>
  );
}
