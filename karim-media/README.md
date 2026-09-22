# Karim Abd Elmalak, media and content

Everything recovered and verified for the artist's website: the images, and the
facts that go with them. No framework, no build step. Use it with anything.

## What is here

| | |
|---|---|
| Artworks | 52 |
| With full catalogue data | 35 (title, year, medium, dimensions, sale status) |
| Photographs of the artist | 3 |
| Series | 6 |
| Exhibitions | 7 |
| Press appearances | 5 |
| CV entries | 26 |

## Layout

    artwork/<series>/       START HERE. Web-ready, trimmed, named, catalogued
    artwork/documentation/  photographs of the artist at work
    originals/              full-resolution source files, up to 8587px
    archive/<exhibition>/   EVERY image recovered from the old site, 135 of them
    thumb/                  small previews of the archive
    contact-sheet.html      open this. A visual index of the whole archive
    video/                  poster frames for the three videos
    data/works.json         the curated works, with metadata
    data/works.csv          the same, for a spreadsheet
    data/archive.json       all 135 archive images, with measured quality
    data/series.json        the six bodies of work
    data/exhibitions.json   where the work has been shown, with video ids
    data/press.json         interviews and broadcasts
    data/cv.json            the full CV
    data/artist.json        name, role, contact, representation, socials

Three sets of images, for three jobs:

**`artwork/`** is what to build with. Trimmed, sized for the web, named, and
joined to `works.json` on the `image` field.

**`originals/`** is the same paintings at full resolution, up to 8587x4574.
Use these for anything printed, or for a zoom view.

**`archive/`** is everything else recovered from the old site: 135 images
across all eight galleries, including the four series with no usable
photography. They are real works, just small -- most trim to 450-700px.
`archive.json` records the measured size, the true ratio, how much white
padding was removed, and whether the work needs rephotographing.

Two warnings in `archive.json` worth heeding. `mappingTrusted: false` means the
old site's own page title contradicted its URL, so which exhibition that image
belongs to is not established. `needsRephotographing: true` means it is too
small to carry a detail page.

## Two things that matter when you build with this

**`aspectRatio` is the ratio of the ARTWORK, not of the file.** The images on the
old site were paintings letterboxed onto a white field, up to 64% padding. These
are trimmed. Size frames from this number and never crop a work to fit a layout:
the collection runs from 0.29 to 2.05, and forcing one shape is what made the
old site wrong.

**Dimensions read height before width**, as every gallery label does. A work
listed 180 x 120 cm is 180 tall.

## What is still missing

- Titles, media and dimensions for the 17 works not in a gallery catalogue
- Statements for the series, in the artist's own words. Six solo exhibitions and
  not one of them is explained anywhere
- Higher-resolution photography for the older shows. Some trim to around 500px
- Recordings for four of the five press appearances

None of these can be invented. They need the artist.
