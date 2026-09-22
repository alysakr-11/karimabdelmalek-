# Karim Abd Elmalak — Website Content Archive

Complete, structured export of every piece of content on the current Wix site
**https://www.karimabdelmalak.com**, collected on **22 Sep 2026**, as the content source for the new site rebuild.

The new site should read from `data/` — nothing here depends on Wix.

## At a glance

| What | Count | Where |
|---|---|---|
| Pages crawled | 14 (6 main + 8 galleries) | `docs/SITE_MAP.md` |
| Exhibitions / galleries | 8 | `data/exhibitions/*.json` |
| Exhibition artwork images | 128 | inside each exhibition file |
| Illustrations | 7 | `data/illustrations.json` |
| TV interviews | 5 | `data/interviews.json` |
| CV entries (exhibition history) | 18 | `data/artist.json` |
| Total media files | 152 | `data/media-manifest.csv` |

## Repository layout

```
.
├── README.md                  ← you are here
├── data/
│   ├── site.json              ← site name, SEO, navigation, old→new URL redirects, socials
│   ├── artist.json            ← bio, education, career, awards, full exhibition CV
│   ├── exhibitions.json       ← index of all galleries (newest first)
│   ├── exhibitions/           ← one file per exhibition, with every image in order
│   │   ├── wsal-2025.json            (15 images)
│   │   ├── zat-2023.json             (23 images)
│   │   ├── the-third-eye-2021.json   (13 images)
│   │   ├── sakan-2019.json           (11 images)
│   │   ├── horra-2017.json           (19 images)
│   │   ├── soul-2016.json            (18 images)
│   │   ├── caravan-arts.json         (4 images + description)
│   │   └── collection.json           (25 images)
│   ├── illustrations.json     ← 7 magazine illustrations
│   ├── interviews.json        ← 5 TV interviews (channel, presenters, poster)
│   ├── contact.json           ← phone, contact form, social links
│   └── media-manifest.csv     ← EVERY image: section, order, original URL, local path
├── docs/
│   ├── SITE_MAP.md            ← how the old site is organised (and its confusing slugs)
│   ├── CONTENT.md             ← all text content, human-readable
│   └── DATA_GAPS.md           ← what's missing and needs input from Karim
├── scripts/
│   └── download_media.py      ← downloads all 152 images at full resolution
└── media/                     ← created by the script (not committed until you run it)
```

## Getting the images

```bash
python3 scripts/download_media.py
```

All image URLs point to the **original, full-resolution** files on Wix's CDN (the resize
parameters used on the live site were stripped). Filenames are predictable:
`media/exhibitions/zat-2023/zat-2023-07.jpg` = the 7th image in the Zat gallery.

## Data conventions

- Every artwork record has `title`, `medium`, `dimensions`, `year` set to `null` — the live site
  shows images only, with no captions. These are placeholders for Karim to fill in.
- Image `order` matches the order on the live site.
- Slugs are clean and year-suffixed (`sakan-2019`); `site.json → redirects` maps the old Wix URLs.
