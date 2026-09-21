# Adding the artwork

The site is finished and every gallery surface is live, but **no artwork files
were available when it was built**, so the grid currently renders clearly
labelled reserved slots. This document is the whole handover.

## Why the slots exist

`karimabdelmalak.com` could not be reached from the build environment — the
network egress policy rejects that host, along with Artsy, Artsper, Safarkhan,
1stDibs and the Internet Archive. Rather than fabricate titles or drop stock
photographs into a painter's portfolio, the gallery holds accurate proportions
with neutral, non-representational panels captioned *Image pending*.

Nothing about the layout changes when the real files arrive. Adding a single
entry to the manifest switches every surface — home, `/works`, the arc strip,
the hero panel, `/works/[slug]`, the sitemap — over to real content. No
component needs editing.

## Step 1 — drop the files in

Put the images in `public/works/`. Any web format works; `.jpg` for
photographic reproductions, `.png` where you need transparency.

```
public/works/
  wesal-01.jpg
  wesal-01-detail.jpg      # optional, shown on hover
  zat-03.jpg
```

Guidance for reproductions:

- **Export at 2000px on the long edge.** Next.js generates the smaller sizes;
  anything larger is wasted bytes.
- **Do not crop, straighten or colour-correct** beyond what the artist or the
  gallery approves. Cards use `object-contain`, so the full work is always
  visible at its true proportion and nothing is cropped by the layout.
- **Keep the file's real pixel dimensions** — you need them in step 2.

## Step 2 — describe them

Edit `src/content/works.ts` and fill the `works` array:

```ts
export const works: Work[] = [
  {
    slug: 'wesal-01',                    // URL segment; must be unique
    title: 'The work's own title',       // never a description invented for it
    year: '2025',
    medium: 'Mixed media on canvas',
    dimensions: '150 × 120 cm',
    collection: 'wesal',                 // a slug from src/content/collections.ts
    image: '/works/wesal-01.jpg',
    hoverImage: '/works/wesal-01-detail.jpg',  // optional
    width: 1600,                         // the file's real pixel width
    height: 2000,                        // the file's real pixel height
    alt: 'A seated figure in ochre and umber, branches rising through the torso.',
  },
];
```

`width` and `height` must be the file's true pixel dimensions. They drive the
masonry packing and reserve the correct box before the image loads, which is
what keeps the grid from jumping as it fills in.

`alt` should describe the work for someone who cannot see it. Do not write
"painting by Karim Abdel Malak" — the surrounding markup already says that.

### Only fill in what you know

Every field except `slug`, `title`, `image`, `width`, `height` and `alt` is
optional, and the UI omits any it does not get. A work with no recorded
dimensions simply shows no dimensions line. **Leave a field out rather than
guess at it.**

## Step 3 — check it

```bash
npm run build     # typechecks the manifest and prerenders every work page
npm run dev       # then look at /works
```

The reserved slots disappear on their own, the "artwork files not yet supplied"
notes stop rendering, and the footer's content-status list shrinks.

## Still outstanding

These are tracked in `MISSING_CONTENT` in `src/content/artist.ts` and are shown
to visitors in the footer, so the list stays honest while it is incomplete.
Remove each entry as you satisfy it.

| Item | Where it goes |
| --- | --- |
| Artwork files and metadata | `public/works/` + `src/content/works.ts` |
| Portrait of the artist | `public/` + wire into `src/components/sections/AboutPreview.tsx` |
| The artist's own biography wording | `artist.statement` in `src/content/artist.ts` |
| Enquiry email address | set `NEXT_PUBLIC_ENQUIRY_ENDPOINT` (see below) |
| Social profiles beyond Instagram | `artist.socials` in `src/content/artist.ts` |

## Turning the enquiry form on

The contact form is disabled, and says so, because no enquiry address could be
verified. Point it at a form service or your own API route:

```bash
# .env.local
NEXT_PUBLIC_ENQUIRY_ENDPOINT=https://example.com/f/your-form-id
```

It posts `FormData` with `name`, `email`, `subject` and `message`, and expects a
2xx response. The gallery address and Instagram link beside it already work and
need no configuration.

## A note on the biography

Everything currently on the About page was assembled from published gallery and
press sources, written as original prose, and each fact carries a `source` field
in `src/content/artist.ts`. **The artist's own wording should replace it.** When
it does, keep the `source` fields accurate — they are what stops a later editor
from mistaking secondary-source claims for the artist's own.
