"""Download the source-matched AstroBin assets recorded in data/astrobin/assets.json."""

import concurrent.futures
import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ASSETS = json.loads((ROOT / 'data/astrobin/assets.json').read_text())


def download(asset):
    directory = ROOT / 'apps/web/public/photography/astro/astrobin' / asset['hash']
    directory.mkdir(parents=True, exist_ok=True)
    targets = [('image.jpg', asset['imageUrl'], asset['imageSha256'])]
    if asset['overlayUrl']:
        targets.append(('source.svg', asset['overlayUrl'], asset['overlaySha256']))
    for filename, url, expected_hash in targets:
        target = directory / filename
        if target.exists():
            if hashlib.sha256(target.read_bytes()).hexdigest() != expected_hash:
                raise ValueError(f'Existing source asset changed: {target}')
            print(f'Already downloaded: {asset["hash"]}/{filename}')
            continue
        body = subprocess.run(
            ['curl', '--fail', '--location', '--silent', '--show-error',
             '--max-time', '60', url], check=True, capture_output=True,
        ).stdout
        if filename.endswith('.jpg') and not body.startswith(b'\xff\xd8'):
            raise ValueError(f'{url}: expected JPEG')
        if filename.endswith('.svg') and b'<svg' not in body:
            raise ValueError(f'{url}: expected SVG')
        if hashlib.sha256(body).hexdigest() != expected_hash:
            raise ValueError(f'Source asset changed since import: {url}')
        with target.open('xb') as output:
            output.write(body)
        print(f'{asset["hash"]}/{filename}: {len(body)} bytes')


if __name__ == '__main__':
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
        list(executor.map(download, ASSETS))
