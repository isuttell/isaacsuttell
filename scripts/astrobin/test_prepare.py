import json
import tempfile
import unittest
import xml.etree.ElementTree as ET
from pathlib import Path

from prepare import ROOT, NS, prepare_image, split_overlay


class AstroBinImportTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source = {item['hash']: item for item in json.loads(
            (ROOT / 'data/astrobin/images.json').read_text())}

    def test_all_images_match_original_dimensions(self):
        records = [prepare_image(item) for item in self.source.values()]
        self.assertEqual(len(records), 10)
        self.assertEqual(sum(record['overlays'] is not None for record in records), 9)

    def test_sessions_drive_dates_and_integration(self):
        record = prepare_image(self.source['kt1jen'])
        self.assertEqual(record['integrationSeconds'], 12650)
        self.assertEqual(record['capturedFrom'], '2020-10-11')
        self.assertEqual(record['capturedTo'], '2020-10-11')
        self.assertEqual(len(record['sessions']), 4)
        self.assertTrue(all(row['gain'] is not None for row in record['sessions']))

    def test_unsolved_image_does_not_receive_fake_calibration(self):
        record = prepare_image(self.source['8t8os3'])
        self.assertIsNone(record['coordinates'])
        self.assertIsNone(record['overlays'])
        self.assertEqual(record['objects'], [])

    def test_advanced_orientation_uses_astrobin_north_convention(self):
        record = prepare_image(self.source['kt1jen'])
        self.assertAlmostEqual(record['coordinates']['orientation'], 247.765)

    def test_logical_star_names_and_description_links_are_preserved(self):
        record = prepare_image(self.source['538yxa'])
        self.assertIn('25 eta Tau', record['objects'])
        self.assertNotIn('Tau', record['objects'])
        self.assertNotIn('25 η ', record['objects'])
        crescent = prepare_image(self.source['oq1l2r'])
        self.assertEqual(crescent['descriptionLinks'][0]['url'],
                         'https://en.wikipedia.org/wiki/Crescent_Nebula')

    def test_grid_split_keeps_white_nebula_labels(self):
        prepare_image(self.source['oq1l2r'])
        directory = ROOT / 'apps/web/public/photography/astro/astrobin/oq1l2r'
        labels = ET.parse(directory / 'labels.svg').getroot()
        grid = ET.parse(directory / 'grid.svg').getroot()
        label_text = [element.text for element in labels.iter(f'{{{NS}}}text')]
        grid_text = [element.text for element in grid.iter(f'{{{NS}}}text')]
        self.assertIn('Sh2-105', label_text)
        self.assertNotIn('Sh2-105', grid_text)
        self.assertTrue(any('°' in text for text in grid_text))
        original = ET.parse(directory / 'source.svg').getroot()
        source_groups = original.find(f'{{{NS}}}g')
        derived_groups = [*labels.find(f'{{{NS}}}g'), *grid.find(f'{{{NS}}}g')]
        self.assertEqual(sum(len(group) for group in source_groups),
                         sum(len(group) for group in derived_groups))
        self.assertEqual(labels.attrib['viewBox'], original.attrib['viewBox'])
        self.assertNotIn('url(', (directory / 'labels.svg').read_text().replace('url(#dropShadow)', ''))

    def test_unexpected_svg_content_fails_closed(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'source.svg'
            path.write_text('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>')
            with self.assertRaisesRegex(ValueError, 'Unexpected SVG element'):
                split_overlay(path)


if __name__ == '__main__':
    unittest.main()
