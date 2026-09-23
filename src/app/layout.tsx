import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Header } from '@/components/chrome/Header';
import { Footer } from '@/components/chrome/Footer';
import { SmoothScroll } from '@/components/chrome/SmoothScroll';
import { RouteMemory } from '@/components/chrome/RouteMemory';
import { SITE_NAME, SITE_URL, socials, mediaUrl } from '@/content/site';
import { artist } from '@/content/artist';

const description =
  'Karim Abd Elmalak is an Egyptian painter, illustrator and sculptor based in Cairo. Six solo exhibitions at Safarkhan Art Gallery, work held at the Egyptian Presidential Palace and the Modern Art Museum.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} — Artworks`, template: `%s — ${SITE_NAME}` },
  description,
  keywords: [
    SITE_NAME,
    ...artist.nameVariants,
    'Egyptian contemporary art',
    'mixed media painting',
    'Safarkhan Art Gallery',
    'Cairo artist',
  ],
  authors: [{ name: SITE_NAME }],
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Artworks`,
    description,
    locale: 'en_GB',
    images: [{ url: mediaUrl('media/site/og-image.jpg') }],
  },
  twitter: { card: 'summary_large_image', title: SITE_NAME, description },
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f1ece2' },
    { media: '(prefers-color-scheme: dark)', color: '#17120c' },
  ],
  colorScheme: 'light',
};

/** Structured data, built only from facts recorded in the content export. */
function PersonJsonLd() {
  const json = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: SITE_NAME,
    alternateName: artist.nameVariants,
    jobTitle: artist.roles.join(', '),
    description,
    url: SITE_URL,
    image: `${SITE_URL}${artist.portrait}`,
    nationality: 'Egyptian',
    address: { '@type': 'PostalAddress', addressLocality: 'Cairo', addressCountry: 'EG' },
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: 'Faculty of Fine Arts, Minia University',
    },
    sameAs: socials.map((s) => s.url),
  };
  return (
    <script
      type="application/ld+json"
      // Serialised from a literal above, so there is no untrusted input here.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PersonJsonLd />
        <SmoothScroll />
        <RouteMemory />
        <Header />
        {/* tabIndex -1: the skip link's target has to be able to take focus, or
            jumping to it moves the view but leaves keyboard focus behind. */}
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
