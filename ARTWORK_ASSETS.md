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

## The short version

```bash
# 1. put the image files in public/works/
node scripts/import-works.mjs scan     # -> content/works.csv, dimensions filled in
#    open content/works.csv, add a title and alt text for each row
node scripts/import-works.mjs build    # -> src/content/works.ts
npm run build
```

That is the whole job. The reserved slots disappear on their own, the "not yet
supplied" notes stop rendering, and the artwork detail pages start generating.

## Step 1 — drop the files in

Put the images in `public/works/`. JPEG, PNG, WebP, GIF and AVIF are all fine.

```
public/works/
  wesal-01.jpg
  wesal-01-detail.jpg      # optional — shown on hover
  zat-03.jpg
```

Two naming conventions the importer understands, both optional:

- A file ending **`-detail`** or **`-hover`** is attached to the work of the
  same base name as its hover image, instead of becoming a work of its own.
- A filename starting with a **collection slug** (`wesal`, `zat`,
  `the-third-eye`, `sakan`, `horra`) pre-fills that work's collection.

Guidance for reproductions:

- **Export at 2000px on the long edge.** Next.js generates the smaller sizes;
  anything larger is wasted bytes.
- **Do not crop, straighten or colour-correct** beyond what the artist or the
  gallery approves. Cards use `object-contain`, so the full work is always
  visible at its true proportion and nothing is cropped by the layout.

## Step 2 — scan

```bash
node scripts/import-works.mjs scan
```

This writes `content/works.csv`, one row per work, with the columns it can fill
in from the files themselves — the path and the true pixel dimensions, read
straight from each file's header. Everything a person has to supply is left
blank.

Re-running `scan` is safe: anything already typed into the CSV is preserved,
and only the file-derived columns are refreshed. Run it again whenever you add
more images.

## Step 3 — fill in the CSV

| column | required | notes |
| --- | --- | --- |
| `file` | yes | filled in by `scan` |
| `title` | **yes** | the artwork's own title — never a description invented for it |
| `alt` | **yes** | describes the work for someone who cannot see it |
| `year` | no | |
| `medium` | no | e.g. `Mixed media on canvas` |
| `dimensions` | no | e.g. `150 × 120 cm` |
| `collection` | no | a slug from `src/content/collections.ts` |
| `width` / `height` | yes | filled in by `scan` — do not edit |

**Leave a field blank rather than guess at it.** The UI omits any optional
field it does not get: a work with no recorded dimensions simply shows no
dimensions line.

For `alt`, describe what is in the picture. Don't write "painting by Karim
Abdel Malak" — the surrounding markup already says that.

## Step 4 — build

```bash
node scripts/import-works.mjs build
```

This writes `src/content/works.ts`. It **refuses to run** while any row is
missing a title or alt text, and tells you which rows, so the manifest can
never be completed by guesswork:

```
Not writing the manifest — 2 thing(s) need a human:

  - row 4: zat-03.jpg has no title
  - row 4: zat-03.jpg has no alt text
```

It also checks every `file` actually exists and every `collection` is a real
slug. Then:

```bash
npm run build     # typechecks the manifest and prerenders every artwork page
npm run dev       # then look at /works
```

## Still outstanding

These are tracked in `MISSING_CONTENT` in `src/content/artist.ts` and are shown
to visitors in the footer, so the list stays honest while it is incomplete.
Remove each entry as you satisfy it.

| Item | Where it goes |
| --- | --- |
| Artwork files and metadata | `public/works/` + `scripts/import-works.mjs` |
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
