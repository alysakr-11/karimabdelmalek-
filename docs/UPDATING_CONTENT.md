# Updating the site's content

Everything the site shows comes from `data/`. No component hard-codes a fact,
a title or an image path — change the JSON and the site follows.

## Where things live

| What | File |
|---|---|
| Site name, navigation, socials, old→new redirects | `data/site.json` |
| Bio, career, awards, workshops, exhibition CV | `data/artist.json` |
| Gallery index (order, titles, years) | `data/exhibitions.json` |
| Each gallery's images, in order | `data/exhibitions/<slug>.json` |
| Magazine illustrations | `data/illustrations.json` |
| TV interviews | `data/interviews.json` |
| Phone, contact image, form copy | `data/contact.json` |
| Image pixel dimensions (generated) | `data/image-dimensions.json` |
| Media files | `public/media/**` |

## Adding or replacing images

1. Put the file under `public/media/...`.
2. Add a record to the relevant JSON with its `local_path` (written as
   `media/...`, without the leading slash — the site maps it to `/media/...`).
3. Re-measure:

```bash
node scripts/measure-media.mjs    # public/media/** -> data/image-dimensions.json
npm run build
```

**Step 3 is not optional.** The gallery packs its masonry from aspect ratios
and reserves each box before the image loads; a file with no recorded size
falls back to 4:5 and the grid will jump as it fills in.

## Filling in artwork captions

Every artwork currently has `title`, `medium`, `dimensions` and `year` set to
`null`, because the source site publishes images with no captions. The UI
handles this: a work with no title shows as *Plate 04*, and each missing field
is simply omitted rather than labelled "unknown".

Fill any of them in and they appear automatically — a title replaces "Plate
04" in the grid caption, the page heading and the `<title>`. **Fill in what is
known and leave the rest null**; a guessed medium is worse than no medium.

## Interviews

`video_url` is `null` for all five, so the page shows the programme still and
says the recording is not yet linked, with a route to the artist's YouTube
channel instead of a play button that cannot play. Set `video_url` on an entry
and that entry becomes a link on its own.

## The contact form

Disabled until it has somewhere to deliver:

```bash
# .env.local
NEXT_PUBLIC_ENQUIRY_ENDPOINT=https://example.com/f/your-form-id
```

It posts `FormData` with `name`, `email`, `subject` and `message`. The phone
number and social links beside it work already.

## Old URLs

`data/site.json → redirects` maps every old Wix path to its new one, and
`next.config.mjs` turns those into permanent redirects at build time. Note the
old slugs do **not** match their contents (`/copy-of-zat` held *Wsal*) — see
`docs/SITE_MAP.md`. Add a row there if another old link turns up.

## What is still outstanding

`src/content/gaps.ts` drives the "Content status" disclosure in the footer, so
the site states its own gaps rather than looking complete while it is not.
Remove an entry as it is satisfied. `docs/DATA_GAPS.md` has the longer list.
