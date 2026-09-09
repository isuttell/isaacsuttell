"""Validate source images, split existing SVG layers, and prepare gallery records."""

import copy
import html
import json
import math
import re
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
PUBLIC = ROOT / 'apps/web/public'
DATA = ROOT / 'apps/web/app/photography/astro/data'
NS = 'http://www.w3.org/2000/svg'
ET.register_namespace('', NS)
CATALOG = {
    'oq1l2r': ('crescent-nebula', 'Crescent Nebula', 'NGC 6888', 'Nebulae'),
    '7trdd4': ('m3', 'M3 Globular Cluster', 'M 3', 'Star clusters'),
    '29kr8z': ('rosette-nebula', 'Rosette Nebula', 'NGC 2244', 'Nebulae'),
    'e54z7e': ('triangulum-ii', 'Triangulum II', 'M 33', 'Galaxies'),
    'zwcqzm': ('western-veil', 'Western Veil', 'NGC 6960', 'Nebulae'),
    '164rlv': ('eastern-veil', 'Eastern Veil', 'IC 1340', 'Nebulae'),
    '538yxa': ('pleiades', 'Pleiades', 'M 45', 'Star clusters'),
    'vmolat': ('triangulum-i', 'Triangulum I', 'M 33', 'Galaxies'),
    '8t8os3': ('orion-starless', 'Orion Nebula, starless', 'M 42', 'Nebulae'),
    'kt1jen': ('andromeda', 'Andromeda Galaxy', 'M 31', 'Galaxies'),
}


class DescriptionLinks(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.current = None

    def handle_starttag(self, tag, attrs):
        if tag == 'a':
            url = dict(attrs).get('href', '')
            if not url.startswith('https://'):
                raise ValueError(f'Unsupported description link: {url}')
            self.current = {'label': '', 'url': url}

    def handle_data(self, data):
        if self.current is not None:
            self.current['label'] += data

    def handle_endtag(self, tag):
        if tag == 'a' and self.current is not None:
            self.links.append(self.current)
            self.current = None


def number(value):
    if value is None:
        return None
    result = float(value)
    if not math.isfinite(result):
        raise ValueError(f'Invalid numeric value: {value}')
    return result


def split_overlay(path):
    root = ET.parse(path).getroot()
    allowed = {'svg', 'title', 'desc', 'defs', 'style', 'filter', 'feOffset',
               'feGaussianBlur', 'feBlend', 'g', 'polyline', 'text', 'circle',
               'ellipse', 'path', 'rect', 'line'}
    for element in root.iter():
        if element.tag.split('}')[-1] not in allowed:
            raise ValueError(f'Unexpected SVG element in {path}: {element.tag}')
        for key, value in element.attrib.items():
            if key.lower().startswith('on') or 'href' in key.lower():
                raise ValueError(f'Unexpected SVG attribute in {path}: {key}')
            if 'url(' in value and value != 'url(#dropShadow)':
                raise ValueError(f'Unexpected SVG resource in {path}')
    parent = root.find(f'{{{NS}}}g')
    if parent is None:
        raise ValueError(f'Missing SVG annotation groups: {path}')
    layers = {name: ET.Element(f'{{{NS}}}svg', {
        'viewBox': root.attrib['viewBox'], 'preserveAspectRatio': 'none',
        'width': '100%', 'height': '100%',
    }) for name in ['labels', 'grid']}
    for layer in layers.values():
        defs = copy.deepcopy(root.find(f'{{{NS}}}defs'))
        for style in list(defs.findall(f'{{{NS}}}style')):
            defs.remove(style)
        layer.append(defs)
    containers = {name: ET.SubElement(layer, f'{{{NS}}}g', parent.attrib)
                  for name, layer in layers.items()}
    first_geometry = True
    for group in parent:
        if not len(group):
            continue
        texts = [e.text or '' for e in group.findall(f'{{{NS}}}text')]
        is_coordinates = bool(texts) and all(
            '°' in text or re.fullmatch(r'\d+h.*', text) for text in texts)
        is_grid = is_coordinates or group.attrib.get('stroke') == '#00ffff'
        if first_geometry:
            if group.attrib.get('stroke') != '#ffffff' or texts:
                raise ValueError(f'Unexpected initial coordinate grid in {path}')
            is_grid = True
            first_geometry = False
        name = 'grid' if is_grid else 'labels'
        containers[name].append(copy.deepcopy(group))
    for name, layer in layers.items():
        for element in layer.iter():
            if 'font-family' in element.attrib:
                element.set('font-family', 'sans-serif')
        ET.ElementTree(layer).write(path.with_name(f'{name}.svg'),
                                   encoding='unicode', xml_declaration=False)
    return [text.text for text in layers['labels'].iter(f'{{{NS}}}text') if text.text]


def prepare_image(raw):
    slug, title, catalog, category = CATALOG[raw['hash']]
    base = f'/photography/astro/astrobin/{raw["hash"]}'
    directory = PUBLIC / base.lstrip('/')
    with Image.open(directory / 'image.jpg') as image:
        width, height = image.size
    if (width, height) != (raw['w'], raw['h']):
        raise ValueError(f'{slug}: full-resolution dimensions do not match source')
    solution = raw['solution']
    labels = []
    overlays = None
    if solution['pixinsightSvgAnnotationHd']:
        svg = ET.parse(directory / 'source.svg').getroot()
        _, _, sw, sh = map(float, svg.attrib['viewBox'].split())
        if abs(sw / sh - width / height) > .001:
            raise ValueError(f'{slug}: overlay aspect ratio does not match image')
        split_overlay(directory / 'source.svg')
        labels = [line.split(',', 5)[5].strip()
                  for line in solution['advancedAnnotations'].splitlines()
                  if line.startswith('Label,')]
        overlays = {name: f'{base}/{name}.svg' for name in ['labels', 'grid']}
    sessions = [{
        'date': row['date'],
        'filter': ' '.join(x for x in [row['filterMake'], row['filterName']] if x) or None,
        'frames': row['number'], 'seconds': number(row['duration']),
        'gain': number(row['gain']), 'sensorTemperature': row['sensorCooling'],
        'binning': row['binning'], 'bortle': row['bortle'],
        'moonIllumination': row['moonIllumination'],
    } for row in raw['deepSkyAcquisitions']]
    sessions.sort(key=lambda row: (row['date'] or '', row['filter'] or ''))
    dates = sorted({row['date'] for row in sessions if row['date']})
    total = sum(row['frames'] * row['seconds'] for row in sessions) if sessions and all(
        row['frames'] is not None and row['seconds'] is not None for row in sessions) else None
    equipment = []
    for key, label in [('imagingTelescopes', 'Telescope'), ('imagingCameras', 'Camera'),
                       ('mounts', 'Mount'), ('filters', 'Filters'),
                       ('focalReducers', 'Focal reducer'), ('guidingTelescopes', 'Guide scope'),
                       ('guidingCameras', 'Guide camera'), ('accessories', 'Accessories'),
                       ('software', 'Processing software')]:
        items = [' '.join(x for x in [item.get('brandName', item.get('make')), item['name']] if x)
                 for item in raw[key] + raw.get(f'{key}2', [])]
        if items:
            equipment.append({'label': label, 'items': list(dict.fromkeys(items))})
    coordinates = None
    if all(solution[key] is not None for key in ['ra', 'dec', 'pixscale', 'orientation']):
        scale = number(solution['advancedPixscale'] or solution['pixscale'])
        orientation = (360 - number(solution['advancedOrientation'])) % 360 if solution['advancedOrientation'] is not None else number(solution['orientation'])
        coordinates = {
            'ra': number(solution['advancedRa'] or solution['ra']),
            'dec': number(solution['advancedDec'] or solution['dec']),
            'pixelScale': scale, 'orientation': orientation,
            'fieldWidth': width * scale / 3600, 'fieldHeight': height * scale / 3600,
        }
    objects = [x.strip() for x in (solution['objectsInField'] or '').split(',') if x.strip()]
    links = DescriptionLinks()
    links.feed(raw['description'])
    return {
        'slug': slug, 'title': title, 'catalog': catalog, 'category': category,
        'src': f'{base}/image.jpg', 'width': width, 'height': height,
        'sourceUrl': f'https://app.astrobin.com/i/{raw["hash"]}',
        'sourceWidth': width, 'sourceHeight': height,
        'description': html.unescape(re.sub('<[^>]+>', '', raw['description'])).strip() or None,
        'descriptionLinks': links.links,
        'capturedFrom': dates[0] if dates else None, 'capturedTo': dates[-1] if dates else None,
        'integrationSeconds': total, 'sessions': sessions, 'equipment': equipment,
        'objects': list(dict.fromkeys(objects + labels)), 'constellation': raw['constellation'],
        'bortle': raw['averageBortleScale'], 'moonIllumination': raw['averageMoonIllumination'],
        'coordinates': coordinates, 'overlays': overlays,
    }


if __name__ == '__main__':
    DATA.mkdir(parents=True, exist_ok=True)
    records = [prepare_image(raw) for raw in json.loads((ROOT / 'data/astrobin/images.json').read_text())]
    for record in records:
        (DATA / f'{record["slug"]}.json').write_text(json.dumps(record, indent=2, ensure_ascii=False) + '\n')
    print(f'Prepared {len(records)} full-resolution images, {sum(bool(r["overlays"]) for r in records)} overlays')
