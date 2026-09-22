import type { Metadata } from 'next';
import Image from 'next/image';
import { interviews, playableInterviews } from '@/content/interviews';
import { socials } from '@/content/site';
import { PageHeader } from '@/components/sections/PageHeader';
import { Reveal } from '@/components/primitives/Reveal';
import { NotchedFrame } from '@/components/primitives/NotchedFrame';
import { ContourField } from '@/components/primitives/ContourField';
import { CurveDivider } from '@/components/primitives/CurveDivider';
import { VideoEmbed } from '@/components/primitives/VideoEmbed';
import { ContactCta } from '@/components/sections/ContactCta';

export const metadata: Metadata = {
  title: 'Interviews',
  description:
    'Television interviews with Karim Abd Elmalak on Al Nahar TV, DMC TV, Channel 1 Egyptian TV and ON TV.',
  alternates: { canonical: '/interviews' },
};

export default function InterviewsPage() {
  const youtube = socials.find((s) => s.platform === 'YouTube');
  const playable = playableInterviews.length;
  const missing = interviews.length - playable;

  return (
    <>
      <PageHeader
        eyebrow="Press"
        lead="Interviews"
        seed={47}
        body={
          playable
            ? `${interviews.length} television appearances. ${playable} of them ${
                playable === 1 ? 'plays' : 'play'
              } here; the rest were embedded with a player that did not survive the move, so for now those are the programme stills.`
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
              const label = `${interview.channel} interview`;

              return (
                <Reveal as="li" key={interview.order} delay={(i % 3) * 70}>
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
                        {interview.file ? (
                          <VideoEmbed
                            file={interview.file}
                            title={label}
                            poster={interview.poster}
                            posterAlt={`${interview.channel} — still from the recording`}
                            priority={i < 3}
                          />
                        ) : (
                          /* No play affordance where there is nothing to play:
                             a dead play button is worse than none. */
                          <Image
                            src={interview.poster}
                            alt={`${interview.channel} interview still`}
                            fill
                            priority={i < 3}
                            sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 31vw"
                            className="object-cover object-center"
                          />
                        )}
                      </div>
                    </div>
                  </NotchedFrame>

                  <div className="mt-4">
                    <p className="t-serif text-xl text-chalk">{interview.channel}</p>
                    {interview.presenters.length > 0 ? (
                      <p className="t-caption mt-1 font-normal text-chalk/60">
                        with {interview.presenters.join(' & ')}
                      </p>
                    ) : null}

                    <p className="t-caption mt-2 font-normal text-chalk/40">
                      {interview.file
                        ? [interview.date, interview.quality].filter(Boolean).join(' · ') ||
                          'Watch'
                        : interview.date ?? 'Recording not yet linked'}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </ul>

          {youtube && missing > 0 ? (
            <Reveal className="mt-14">
              <div className="rounded-2xl border border-ochre-lift/25 bg-ochre-lift/5 p-6">
                <p className="t-eyebrow mb-3 text-ochre-lift">
                  {missing} {missing === 1 ? 'recording' : 'recordings'} still missing
                </p>
                <p className="t-body max-w-[60ch] text-sm text-chalk/70">
                  The old site played these through a Wix player that left no link behind,
                  and they have not turned up since. The artist&rsquo;s own channel carries
                  his published video.
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
