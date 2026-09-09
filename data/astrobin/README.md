# AstroBin gallery source

Imported from [Isaac Suttell's public AstroBin gallery](https://app.astrobin.com/u/ZakAstro) on September 9, 2026 UTC.

- `images.json` preserves the complete public image API responses for all ten uploads. The endpoint used by the AstroBin page is `/api/v2/images/image/?hash=<hash>&skip-thumbnails=only-not-ready`.
- `assets.json` records the full-resolution display URL, source dimensions, page URL, corresponding PixInsight SVG URL, and downloaded SHA-256 hashes for each image. Display URLs came from AstroBin's `/HASH/0/thumb/real/` endpoint, also used by its frontend image service. These are full-resolution display JPEGs, not camera RAW/FITS files or guaranteed byte-identical original uploads.
- All ten downloaded JPEG dimensions match the API's original width and height. Nine records have PixInsight SVG annotations. The starless Orion upload has no successful solution and no overlay.
- The older local Orion image and M86 field are retained separately. Capture metadata is not copied onto them from different images, and dates in local filenames are not treated as verified acquisition dates.

To restore recorded assets, run `python3 scripts/astrobin/download.py`. It uses curl and never overwrites an existing download. Then run `python3 scripts/astrobin/prepare.py` with Pillow installed to validate dimensions, split source SVGs, and regenerate the ten display records. The two local-only records are maintained separately.

The preparation script keeps every source SVG as `source.svg`, validates its element/resource structure, and derives `labels.svg` and `grid.svg`. The grid contains the source coordinate grid and constellation geometry; object markers and names remain in the labels layer. The SVGs retain their original viewBox and geometry. They scale to the matching full image, including the subpixel aspect-ratio difference caused by AstroBin rounding its HD output to integer dimensions. External font references are removed from the derived layers so the viewer has no AstroBin dependency.

Source object names are the union of the source catalog list and the logical labels in the advanced annotation records. This preserves complete star names even when the SVG splits Greek symbols into separate text nodes. Aliases and description reference URLs are preserved. Exposure totals are calculated from every acquisition row's frame count and duration; dates come from acquisition rows, not upload or gallery dates. Missing fields stay null. Field dimensions are derived from original dimensions and the solved pixel scale. Orientation follows AstroBin's north convention: the negative advanced orientation normalized to 0–360 degrees. All source precision remains in the raw snapshot.

The gallery corrects the local `NGC6069` filename's label using the source Western Veil record, NGC 6960. It also retains both separately uploaded Triangulum images and the Rosette mosaic's original acquisition notes.

The website consumes the generated JSON records in `apps/web/app/photography/astro/data/` through `photos.ts`. Raw API snapshots are not shipped in the client bundle. The site serves local assets and never calls AstroBin during a visit.
