"""Generate gallery overlays from a saved Astrometry.net WCS and object catalog."""
import argparse
import hashlib
import html
import json
from pathlib import Path

import numpy as np
from astropy.io import fits
from astropy.wcs import WCS

ROOT = Path(__file__).resolve().parents[2]


def svg(width, height, content):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" '
            f'preserveAspectRatio="none">{content}</svg>\n')


def text(x, y, label, color, size=15):
    return (f'<text x="{x:.3f}" y="{y:.3f}" fill="{color}" font-family="sans-serif" '
            f'font-size="{size}" stroke="#050505" stroke-width="3" '
            f'paint-order="stroke" stroke-linejoin="round">{html.escape(label)}</text>')


def labels_svg(annotations, width, height):
    placed = []
    content = []
    for item in sorted(annotations, key=lambda item: item['type'] != 'ngc'):
        names = item['names']
        if item['type'] == 'star' and len(names) == 1:
            continue  # The Trapezium label already identifies its tightly packed members.
        label = next((name for name in names if name.startswith('M ')), names[0])
        x, y = item['pixelx'] - 0.5, item['pixely'] - 0.5
        color = '#a3e635' if item['type'] == 'ngc' else '#38bdf8'
        length = len(label) * 9
        found = None
        for offset in range(0, height, 24):
            for dx, dy in [(16, -16-offset), (16, 28+offset), (-length-16, -16-offset)]:
                tx, ty = x + dx, y + dy
                box = (tx-3, ty-18, tx+length+3, ty+5)
                if box[0] < 8 or box[1] < 8 or box[2] > width-8 or box[3] > height-8:
                    continue
                if all(box[2] < b[0] or box[0] > b[2] or box[3] < b[1] or box[1] > b[3]
                       for b in placed):
                    found = (tx, ty, box)
                    break
            if found:
                break
        if found is None:
            raise ValueError(f'Cannot place label: {label}')
        tx, ty, box = found
        placed.append(box)
        content.append(f'<circle cx="{x:.3f}" cy="{y:.3f}" r="5" fill="none" '
                       f'stroke="{color}" stroke-width="1"/>')
        content.append(f'<path d="M{x:.3f},{y:.3f} L{tx:.3f},{ty-5:.3f}" '
                       f'fill="none" stroke="{color}" stroke-width="0.8"/>')
        content.append(text(tx, ty, label, color))
    return svg(width, height, ''.join(content))


def grid_svg(wcs, width, height):
    perimeter = np.linspace(0.5, width-0.5, 100)
    vertical = np.linspace(0.5, height-0.5, 100)
    ra, dec = wcs.all_pix2world(
        np.concatenate([perimeter, perimeter, np.full(100, 0.5), np.full(100, width-0.5)]),
        np.concatenate([np.full(100, 0.5), np.full(100, height-0.5), vertical, vertical]), 1)
    content = []
    # Quarter-degree lines suit this roughly one-degree field; project every sample through SIP.
    for axis, values, other in [(0, ra, dec), (1, dec, ra)]:
        for value in np.arange(np.ceil(values.min()*4)/4, values.max(), 0.25):
            varying = np.linspace(other.min()-0.05, other.max()+0.05, 300)
            fixed = np.full_like(varying, value)
            x, y = wcs.all_world2pix(*( (fixed, varying) if axis == 0 else (varying, fixed) ), 1)
            x, y = x-0.5, y-0.5
            if not np.isfinite([x, y]).all():
                raise ValueError('Grid projection returned non-finite coordinates')
            points = ' '.join(f'{a:.3f},{b:.3f}' for a, b in zip(x, y))
            content.append(f'<polyline points="{points}" fill="none" stroke="#fafafa" '
                           'stroke-width="0.8"/>')
            inside = np.where((x > 24) & (x < width-130) & (y > 24) & (y < height-24))[0]
            if len(inside):
                i = inside[0]
                label = f'{"RA" if axis == 0 else "Dec"} {value:.2f}°'
                content.append(text(x[i]+4, y[i]-4, label, '#fafafa', 12))
    return svg(width, height, ''.join(content))


def prepare(slug):
    source = ROOT / 'data/astrometry' / slug
    record_path = ROOT / 'apps/web/app/photography/astro/data' / f'{slug}.json'
    record = json.loads(record_path.read_text())
    image = ROOT / 'apps/web/public' / record['src'].lstrip('/')
    image_hash = hashlib.sha256(image.read_bytes()).hexdigest()
    previous = source / 'validation.json'
    if previous.exists() and json.loads(previous.read_text())['imageSha256'] != image_hash:
        raise ValueError('The photograph changed; obtain a new plate solution before regenerating')
    header = fits.getheader(source / 'solution.wcs')
    wcs = WCS(header)
    width, height = record['width'], record['height']
    if (header['IMAGEW'], header['IMAGEH']) != (width, height):
        raise ValueError('WCS and displayed image dimensions differ')
    info = dict(line.split(maxsplit=1) for line in (source / 'wcs-info.txt').read_text().splitlines())
    annotations = json.loads((source / 'annotations.json').read_text())['annotations']
    matches = fits.getdata(source / 'matches.fits')
    x, y = wcs.all_world2pix(matches['index_ra'], matches['index_dec'], 1)
    residual = np.hypot(x-matches['field_x'], y-matches['field_y'])
    if len(matches) < 20 or not np.isfinite(residual).all() or np.percentile(residual, 95) > 1:
        raise ValueError('Solution lacks 20 matches within a one-pixel 95th percentile residual')
    base = f'/photography/astro/solved/{slug}'
    output = ROOT / 'apps/web/public' / base.lstrip('/')
    output.mkdir(parents=True, exist_ok=True)
    (output / 'labels.svg').write_text(labels_svg(annotations, width, height))
    (output / 'grid.svg').write_text(grid_svg(wcs, width, height))
    scale = float(info['pixscale'])
    record['coordinates'] = {
        'ra': float(info['ra_center']), 'dec': float(info['dec_center']),
        'pixelScale': scale, 'orientation': float(info['orientation_center']) % 360,
        'fieldWidth': width*scale/3600, 'fieldHeight': height*scale/3600,
    }
    record['overlays'] = {'labels': f'{base}/labels.svg', 'grid': f'{base}/grid.svg'}
    record['objects'] = list(dict.fromkeys(name for item in annotations for name in item['names']))
    record_path.write_text(json.dumps(record, ensure_ascii=False, indent=2)+'\n')
    report = {
        'imageSha256': image_hash,
        'wcsSha256': hashlib.sha256((source/'solution.wcs').read_bytes()).hexdigest(),
        'matchedStars': len(matches), 'medianResidualPixels': float(np.median(residual)),
        'p95ResidualPixels': float(np.percentile(residual, 95)),
        'maxResidualPixels': float(residual.max()),
    }
    (source / 'validation.json').write_text(json.dumps(report, indent=2)+'\n')
    print(json.dumps(report, indent=2))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('slug')
    prepare(parser.parse_args().slug)
