# Orion plate solution

The existing 1200 × 906 JPEG was solved locally with Astrometry.net 0.97 using its Tycho-2 `index-4107.fits`. No capture metadata was inferred from the filename and the photograph was not altered.

The initial blind match reported 48 matches, zero conflicts, and log odds 272.018. The refined solution contains 52 catalog correspondences in `matches.fits`. `validation.json` records the source and WCS hashes and residuals measured by projecting those catalog coordinates through the saved TAN-SIP WCS with Astropy 6.0.1.

`solution.wcs` is the complete solver WCS. `wcs-info.txt` is the complete `wcsinfo` output. `annotations.json` is the complete built-in NGC/Messier and bright-star catalog output from `plot-constellations`. Labels use catalog centers, not estimated nebula boundaries. Closely packed Trapezium components remain in the object-name list but share the Trapezium label in the image.

The input JPEG retains top-to-bottom row order during solving. Astrometry.net's one-based pixel centers become SVG pixel centers by subtracting 0.5 from both axes, with no vertical flip. Grid samples pass through the full TAN-SIP transform. Label positions can move to avoid text collisions; leader lines stay anchored to the solved catalog positions. Orientation is the solver's angle of image-up east of north, normalized to 0–360 degrees. Field dimensions use width and height multiplied by the reported pixel scale.

Reproduce from the repository root (install Astrometry.net and Astropy first):

```sh
mkdir -p /tmp/orion-index /tmp/orion-solve
curl --fail --location https://data.astrometry.net/4100/index-4107.fits --output /tmp/orion-index/index-4107.fits
solve-field apps/web/public/photography/astro/2020-10-30-M42_p.jpg --dir /tmp/orion-solve --out orion --index-dir /tmp/orion-index --scale-units degwidth --scale-low 0.3 --scale-high 3 --cpulimit 60 --no-plots --new-fits none
```

To regenerate display assets from the saved solution:

```sh
python scripts/astrobin/prepare_solved.py orion-nebula
bunx prettier --write apps/web/app/photography/astro/data/orion-nebula.json data/astrometry/orion-nebula/*.json
```

Sources: [Astrometry.net solving and output formats](https://astrometry.net/doc/readme.html), [Tycho-2 index files](https://data.astrometry.net/4100/), [Astropy WCS coordinate API](https://docs.astropy.org/en/stable/wcs/wcsapi.html).
