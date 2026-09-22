import type { Metadata } from 'next';
import Image from 'next/image';
import { artist, cvDated, cvUndated } from '@/content/artist';
import { PageHeader } from '@/components/sections/PageHeader';
import { Reveal } from '@/components/primitives/Reveal';
import { ContactCta } from '@/components/sections/ContactCta';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Karim Abd Elmalak — painter, illustrator and sculptor. Graphics graduate of the Faculty of Fine Arts, Minia University, exhibiting in Cairo since 2001.',
  alternates: { canonical: '/about' },
};

function CvRow({ entry }: { entry: (typeof cvDated)[number] }) {
  return (
    <div className="grid gap-1 border-b border-ink/10 py-4 md:grid-cols-12 md:gap-6 md:py-5">
      <p className="t-display text-lg text-ochre md:col-span-2">{entry.year ?? '—'}</p>
      <h3 className="t-serif text-lg text-ink md:col-span-6">{entry.title}</h3>
      <p className="t-body text-sm text-ink-soft md:col-span-4">
        {[entry.venue, entry.city].filter(Boolean).join(', ')}
        {entry.type ? <span className="text-ink-muted"> · {entry.type}</span> : null}
      </p>
    </div>
  );
}

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Biography"
        lead="About"
        trail="the artist"
        seed={31}
        body={artist.roles.join(' · ')}
      />

      <section data-nav-theme="light" className="bg-paper pb-20 sm:pb-28">
        <div className="shell grid gap-12 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-7">
            <Reveal>
              <div className="relative mb-10 aspect-[4/3] w-full overflow-hidden rounded-2xl bg-paper-deep">
                <Image
                  src={artist.portrait}
                  alt={`${artist.name}, portrait`}
                  fill
                  priority
                  sizes="(max-width: 768px) 92vw, 56vw"
                  className="object-cover object-center"
                  // Centre-cropping a tall portrait into this landscape frame
                  // cut his face off; anchor on it instead.
                  style={
                    artist.portraitFocus
                      ? {
                          objectPosition: `${artist.portraitFocus.x * 100}% ${artist.portraitFocus.y * 100}%`,
                        }
                      : undefined
                  }
                />
              </div>
            </Reveal>

            <Reveal delay={60}>
              <h2 className="t-eyebrow mb-5 text-ochre">Career</h2>
              <ul className="mb-12 space-y-4">
                {artist.career.map((line) => (
                  <li key={line} className="t-body flex gap-4 text-ink-soft">
                    <span aria-hidden className="mt-2.5 h-px w-6 shrink-0 bg-ochre/60" />
                    <span className="max-w-[56ch]">{line}</span>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={120}>
              <h2 className="t-eyebrow mb-5 text-ochre">Exhibitions</h2>
              <div className="border-t border-ink/10">
                {cvDated.map((entry, i) => (
                  <CvRow key={`${entry.year}-${entry.title}-${i}`} entry={entry} />
                ))}
                {cvUndated.map((entry, i) => (
                  <CvRow key={`undated-${i}`} entry={entry} />
                ))}
              </div>
              {cvUndated.length > 0 ? (
                <p className="t-caption mt-4 font-normal text-ink-muted">
                  Entries shown as “—” have no year recorded.
                </p>
              ) : null}
            </Reveal>
          </div>

          <aside className="md:col-span-4 md:col-start-9">
            <Reveal delay={100}>
              <dl className="space-y-7 rounded-2xl border border-ink/12 bg-paper-deep/60 p-6">
                <div>
                  <dt className="t-eyebrow mb-2 text-ink-muted">Education</dt>
                  {artist.education.map((e) => (
                    <dd key={e.institution} className="t-body text-sm text-ink-soft">
                      {e.institution} — {e.department}
                    </dd>
                  ))}
                </div>
                <div>
                  <dt className="t-eyebrow mb-2 text-ink-muted">Awards</dt>
                  {artist.awards.map((a) => (
                    <dd key={a.title} className="t-body text-sm text-ink-soft">
                      {a.title}, {a.event} — {a.location}, {a.year}
                    </dd>
                  ))}
                </div>
                <div>
                  <dt className="t-eyebrow mb-2 text-ink-muted">Workshops</dt>
                  {artist.workshops.map((w) => (
                    <dd key={w.title} className="t-body text-sm text-ink-soft">
                      {w.title} — {w.location}, {w.year}
                    </dd>
                  ))}
                </div>
                <div>
                  <dt className="t-eyebrow mb-2 text-ink-muted">Based in</dt>
                  <dd className="t-body text-sm text-ink-soft">{artist.location}</dd>
                </div>
              </dl>
            </Reveal>

          </aside>
        </div>
      </section>

      <ContactCta />
    </>
  );
}
