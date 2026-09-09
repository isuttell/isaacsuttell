export interface AstroSession {
  date: string | null;
  filter: string | null;
  frames: number | null;
  seconds: number | null;
  gain: number | null;
  sensorTemperature: number | null;
  binning: number | null;
  bortle: number | null;
  moonIllumination: number | null;
}

export interface AstroPhoto {
  slug: string;
  title: string;
  catalog: string;
  category: 'Galaxies' | 'Nebulae' | 'Star clusters';
  src: string;
  width: number;
  height: number;
  sourceUrl: string | null;
  sourceWidth: number | null;
  sourceHeight: number | null;
  description: string | null;
  descriptionLinks: { label: string; url: string }[];
  capturedFrom: string | null;
  capturedTo: string | null;
  integrationSeconds: number | null;
  sessions: AstroSession[];
  equipment: { label: string; items: string[] }[];
  objects: string[];
  constellation: string | null;
  bortle: number | null;
  moonIllumination: number | null;
  coordinates: {
    ra: number;
    dec: number;
    pixelScale: number;
    orientation: number;
    fieldWidth: number;
    fieldHeight: number;
  } | null;
  overlays: { labels: string; grid: string } | null;
}
