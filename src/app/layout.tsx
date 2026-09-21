import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Header } from '@/components/chrome/Header';
import { Footer } from '@/components/chrome/Footer';
import { SmoothScroll } from '@/components/chrome/SmoothScroll';
import { artist } from '@/content/artist';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.karimabdelmalak.com';

const description =
  'Karim Abdel Malak is an Egyptian contemporary artist working in mixed media — graphic design combined with acrylic and textured oils, in a monotone palette of wooden and earthen tones.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${artist.name} — ${artist.role}`,
    template: `%s — ${artist.name}`,
  },
  description,
  keywords: [
    artist.name,
    artist.nameAlt,
    'Egyptian contemporary art',
    'mixed media painting',
    'Safarkhan Art Gallery',
    'Cairo artist',
  ],
  authors: [{ name: artist.name }],
  openGraph: {
    type: 'website',
    siteName: artist.name,
    title: `${artist.name} — ${artist.role}`,
    description,
    locale: 'en_GB',
  },
  twitter: { card: 'summary_large_image', title: artist.name, description },
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

/** Structured data, built only from facts recorded in the content module. */
function PersonJsonLd() {
  const json = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: artist.name,
    alternateName: artist.nameAlt,
    jobTitle: artist.role,
    description,
    url: SITE_URL,
    nationality: 'Egyptian',
    address: { '@type': 'PostalAddress', addressLocality: 'Cairo', addressCountry: 'EG' },
    alumniOf: { '@type': 'CollegeOrUniversity', name: 'Minya University, Faculty of Fine Arts' },
    sameAs: artist.socials.map((s) => s.href),
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
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
