# Virgo Cluster plate solution

The existing 1201 × 934 JPEG was solved locally with Astrometry.net 0.97. The photograph is unchanged and no capture metadata was inferred from its filename.

An initial blind solution with Tycho-2 `index-4107.fits` found 11 matches, zero conflicts, and log odds 21.6045. Its center was RA 186.598137°, Dec 12.923014°. A second solve used the denser Gaia DR2 + Tycho-2 `index-5205-27.fits`, searching within two degrees of that center. That match reported 227 matches, 17 conflicts, and log odds 835.269. Its refined WCS contains 232 catalog correspondences. The final median residual is 0.0529 pixels, the 95th percentile is 0.1673 pixels, and the maximum is 2.0894 pixels; full-precision metrics and source hashes are in `validation.json`.

`solution.wcs` preserves the complete TAN-SIP WCS. `matches.fits` retains every final correspondence, including outliers. `wcs-info.txt` is the complete `wcsinfo` output. `annotations.json` contains all 14 in-frame NGC/IC entries returned by the built-in catalog with no minimum angular-size cutoff. M84 and M86 are included under their NGC entries. Catalog membership does not assert that every faint object is visibly resolved in the JPEG.

Coordinate conversion and rendering use the same [validated pipeline as Orion](../orion-nebula/README.md): one-based input pixel centers become SVG centers by subtracting 0.5 with no vertical flip. Labels point to catalog centers; they do not trace galaxy boundaries. All grid samples pass through the complete TAN-SIP transform. Orientation is the angle of image-up east of north, normalized to 0–360 degrees.

Reproduce the dense-catalog solve from the repository root:

```sh
mkdir -p /tmp/virgo-index /tmp/virgo-solve
curl --fail --location https://portal.nersc.gov/project/cosmo/temp/dstn/index-5200/LITE/index-5205-27.fits --output /tmp/virgo-index/index-5205-27.fits
solve-field apps/web/public/photography/astro/2021-04-01-M86-01_p.jpg --dir /tmp/virgo-solve --out virgo --index-dir /tmp/virgo-index --scale-units degwidth --scale-low 0.8 --scale-high 1.3 --ra 186.598137 --dec 12.923014 --radius 2 --cpulimit 60 --no-plots --new-fits none
```

To regenerate the catalog from the saved WCS:

```sh
plot-constellations -w data/astrometry/virgo-cluster/solution.wcs -L -N -B -F 0 -J
```

To regenerate display assets from the saved solution and catalog:

```sh
python scripts/astrobin/prepare_solved.py virgo-cluster
bunx prettier --write apps/web/app/photography/astro/data/virgo-cluster.json data/astrometry/virgo-cluster/*.json
```

Sources: [Astrometry.net solving and output formats](https://astrometry.net/doc/readme.html), [official catalog index recommendations](https://data.astrometry.net/), [Gaia DR2 + Tycho-2 light index files](https://portal.nersc.gov/project/cosmo/temp/dstn/index-5200/LITE/).
