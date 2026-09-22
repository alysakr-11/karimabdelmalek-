# Karim Abd Elmalak — portfolio

A premium single-artist portfolio for the Egyptian contemporary painter Karim
Abdel Malak, built with Next.js.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build; typechecks and prerenders every route
npm run typecheck
npm run lint
```

---

## What this is

The brief was to take the *design approach* of a well-known personal-brand
portfolio site and translate it into an artist's portfolio. That means the
structure, the motion vocabulary and the compositional habits were studied and
rebuilt — and everything else is original to this project: the palette, the
typefaces, the textures, the copy, the identity mark and all component code.
No branding, colour identity, imagery or other asset from the reference is
reproduced here.

### The translation

| Reference pattern | What it became here |
| --- | --- |
| Acid-green accent on bone | Burnt ochre on warm linen — the artist's own palette is described as *wooden and earthen tones*, so the accent follows the work instead of fighting it |
| Product grid captioned by name + year | Artwork grid captioned by title + year, one grid per exhibition |
| Season-by-season timeline rail | The five solo exhibitions, 2017–2025, as a horizontal rail |
| Merchandise call to action | Enquiry and gallery-visit routes |
| Sponsor logo wall | Cut — there is no honest equivalent, and filler would have been worse |

### The signature geometry

Three motifs carry the whole design, all rebuilt from scratch:

- **Notched cards.** A rounded rectangle whose bottom-left is cut away so the
  bottom edge steps down into a tab holding the caption. The outline is
  generated from *measured pixels* (`src/lib/notch.ts` + `NotchedFrame.tsx`)
  rather than expressed in `objectBoundingBox` units, so the corner radii stay
  perfectly circular at every card size and aspect ratio — which a
  `clip-path` in fractional units cannot do.
- **Organic section dividers.** A flat rule interrupted by a wide rounded
  plateau, used at every light/dark boundary.
- **Topographic contours.** An original generator (`src/lib/contours.ts`) that
  produces lobed, map-like fields from Catmull-Rom splines. Deterministic from a
  seed, so server and client markup always match.

---

## Architecture

```
data/            the archive export — JSON, the single source of truth
src/
  content/       artist, exhibitions, catalogue, illustrations, interviews,
                 contact, site, media, gaps — a typed view over data/
  lib/           notch geometry, contour generator, measurement hooks
  components/
    chrome/      Header, MenuOverlay, Footer, SmoothScroll, nav
    primitives/  NotchedFrame, ArtworkCard, ArtworkGrid, MasonryColumns,
                 CroppedImage, ContourField, CurveDivider, Reveal,
                 SectionHeading, PillButton
    sections/    Hero, Statement, ArcStrip, FeaturedWorks, ExhibitionsRail,
                 AboutPreview, ContactCta, EnquiryForm, PageHeader
  app/           routes, global stylesheet, sitemap, robots
```

**`data/` is the single source of truth; `src/content/` is a typed view over
it.** Every module there reads its JSON and exports shaped, validated objects —
`site.ts` reads `data/site.json`, `exhibitions.ts` reads the per-show files
under `data/exhibitions/`, and so on. No component hard-codes a fact about the
artist, and nothing in `src/content/` hand-copies one: **change the JSON, not
the TypeScript.**

The single exception is `gaps.ts`, which is a hand-maintained list of what the
archive could not supply. It mirrors `docs/DATA_GAPS.md` and the footer renders
it, so the site states its own incompleteness rather than looking finished while
it is not.

Notable choices:

- **Masonry as real columns** (`MasonryColumns.tsx`) rather than CSS
  multi-column, because each column carries its own vertical offset — the
  staggered rhythm the reference grid uses, which multi-column cannot express.
  Packing is greedy shortest-column-first, driven only by aspect ratio, so it is
  deterministic across server and client.
- **`Reveal` starts visible** and only hides once its observer is confirmed
  running, so content can never be stranded invisible if JS fails or
  `IntersectionObserver` is missing.
- **Fonts are self-hosted** in `public/fonts` with the original unicode-ranges
  intact, so there is no third-party request and no layout shift.
- **Lenis is skipped entirely** on coarse pointers (the OS already provides
  momentum there) and under `prefers-reduced-motion`.

## Accessibility

Semantic landmarks and heading order throughout; a skip link; the menu is a
focus-trapped `role="dialog"` that restores focus and locks background scroll;
`inert` keeps the closed menu out of the tab order; visible focus rings that
invert on dark grounds; and every card interaction is reachable by keyboard —
focus does exactly what hover does, lighting the same notched outline.

`prefers-reduced-motion` strips transforms and transitions, disables smooth
scroll, and forces every reveal to its final state.

---

## Fidelity notes

Worth stating plainly, since the brief asked for honesty about this:

- The reference site was studied **from a 9-second screen recording**, not from
  the live site — the environment's network policy blocked it. The recording
  covers a bottom-to-top scroll pass and a hover demonstration on the grid.
  Section structure, the notched cards, the dividers, the arc strip, the
  staggered masonry, the timeline rail, the two-register headings and the
  card hover treatment are all reproduced from what is visible there. (What
  the cards do here is a slow scale with the notched outline lighting in the
  accent colour — not an image swap.)
- **The hero, the menu-open animation, page transitions and any cursor effects
  are not visible in the recording.** Those are original compositions built to
  match the rest of the language, not reproductions. `MenuOverlay.tsx` says so
  in a comment.
- Nothing here is pixel-matched to the reference, and it is not meant to be.

## Content

Everything comes from `data/` — a structured export of the artist's previous
site, committed in full: 8 exhibitions holding 128 works, 7 illustrations, 5
interviews, the biography and CV, and 152 media files at original resolution —
plus `karim-media/`, the recovered archive and the gallery catalogue that names
31 of those works. No component hard-codes a fact or an image path.

The source site publishes artwork **without captions**, so every artwork record
has `title`, `medium`, `dimensions` and `year` set to `null`. The site does not
invent them: a work shows as *Plate 04* until a real title is supplied, and
absent fields are omitted rather than guessed. `src/content/gaps.ts` lists what
is still missing and renders it in the footer.

### The gallery catalogue

**31 works are now named.** Safarkhan Art Gallery, who represent him, publish
catalogue records for the two shows they held — Wesāl (2025) and Zāt (2023) —
with titles, years, media, sizes and sale status. Those records live in
`karim-media/` and are the only place this information exists.

They are keyed to the gallery's own photography, not to the files this site
serves, and nothing in either source says which record is which plate. So the
join is established from the pictures themselves: `scripts/match-catalogue.mjs`
crops each plate to its measured trim box, normalises both images for the two
photographers' different exposure, scores every pairing by pixel distance plus
an aspect-ratio penalty, and takes the globally cheapest one-to-one assignment.
A pairing is written to `data/catalogue.json` only if it is its record's
cheapest *and* clears a distance and a runner-up-margin threshold.

That last rule is the point of the exercise. It rejects the two *Zat Highchair*
sculptures — near-identical pieces, photographed alike, where the evidence
genuinely cannot say which is I and which is II — and all twenty Third Eye
records, whose catalogue titles are only "Untitled" anyway. Those works keep
their plate numbers. **A plate number is honest; a wrong title is not.**

Two conventions carried over from the gallery and surfaced in the UI:
dimensions read **height before width** (a work listed `180 x 120 cm` is 180
tall — reading it the other way inverts every portrait in the show), and each
plate page credits Safarkhan rather than presenting the details as this site's
own claim.

Fourteen of the Wesāl titles are Arabic. They are shown as the artist titled
them, marked `lang="ar" dir="rtl"` so they render and read correctly, and set
in a self-hosted Noto Naskh Arabic — added to every font stack, where its
unicode-range means it is reached for an Arabic codepoint and never for a Latin
one. No English renderings were invented.

See **[docs/UPDATING_CONTENT.md](./docs/UPDATING_CONTENT.md)** to change any of
it, and **[docs/CONTENT_ARCHIVE.md](./docs/CONTENT_ARCHIVE.md)** for how the
export itself is organised.

## Testing

```bash
npm test              # Playwright, against a production build
npm run test:ui       # the same suite, interactively
npm run test:report   # open the last HTML report
```

`tests/e2e/` holds 88 tests. They run against `next start` on a real build,
not `next dev` — the reveals, the prerendered routes and the 404 status all
behave differently under the dev server, and it is the production output that
ships. The config starts and stops the server itself.

What they cover, in Chromium at 1440 / 834 / 390 px across all eight route
shapes:

| Spec | Asserts |
| --- | --- |
| `smoke` | every route returns 200 and renders an `h1`; an unknown path returns a real 404 rather than a 200 that says 404; `robots.txt` and `sitemap.xml` serve, and the sitemap carries the plate pages; no console errors, uncaught exceptions or failed requests on any route |
| `layout` | no horizontal overflow at any of the three widths, after scrolling the whole page; no display heading collapsed or starting off the left edge |
| `reveals` | nothing left stranded invisible after scrolling to the bottom; **and with JavaScript disabled entirely**, which is the guarantee `Reveal` exists to make |
| `menu` | the closed menu is `inert`, `aria-hidden` and unreachable by 25 tabs; opening moves focus in, locks scroll and sets `aria-expanded`; Tab and Shift+Tab both stay inside; Escape and the Close button restore focus to the trigger and unlock scrolling; a link navigates and leaves the menu closed |
| `a11y` | one `main`, one `h1`, one `header`, one `footer` per route, and no skipped heading levels; the skip link is the first tab stop **and moves focus into `main`**; every artwork card is a real link with alt text; keyboard focus lights the notched outline exactly as hover does |
| `reduced-motion` | under `prefers-reduced-motion: reduce`, every reveal is at its final state without scrolling, Lenis is not installed, and native scrolling still works |
| `navigation` | the old Wix paths return a permanent redirect; an in-page anchor updates the hash without a full document load |

Only Chromium runs by default, because that is the only engine this has ever
been verified against. `PW_ALL_BROWSERS=1` adds Firefox and WebKit projects —
see the cross-browser issue before trusting them.

If Playwright's own browser download is unavailable, point the suite at a
Chromium you already have: `PW_CHROMIUM_PATH=/path/to/chromium npm test`.

### Still not covered

- **Real devices.** iOS and Android are emulated by viewport only. Lenis,
  `inert` and AVIF fallback all need a real Safari.
- **Colour contrast.** Reported failing by axe; there is no automated check
  here yet.
- **Real load.** The suite runs against local files on a fast disk, not 133 MB
  of media over a mobile connection.
