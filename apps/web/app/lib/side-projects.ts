import { mediaUrl } from './media';

export const sideProjects = [
  {
    id: 'panda-boom',
    title: 'Panda Boom!',
    href: 'https://pandaboom.run/',
    image: mediaUrl('/previews/panda-boom-gameplay-720p60-poster.png'),
    preview: mediaUrl('/previews/panda-boom-gameplay-720p60.mp4'),
    summary:
      'A pixel-art roguelike set in Japan. A panda runs a little kitchen at the edge of a bamboo forest, and every critter wants a taste. Plays in the browser.',
  },
  {
    id: 'slop-analyzer',
    title: 'Slop Analyzer',
    href: 'https://slop.zaks.io/',
    image: mediaUrl('/previews/slop-analyzer-report-720p60-poster.png'),
    preview: mediaUrl('/previews/slop-analyzer-report-720p60.mp4'),
    summary:
      'Scans a webpage for formulaic writing and stock design patterns, then marks each flagged sentence on a screenshot of the page.',
  },
  {
    id: 'blackhole',
    title: 'Gravitational Lensing',
    href: 'https://blackhole.zaks.io/',
    image: mediaUrl('/previews/gravitational-lensing-1080p60-poster.png'),
    preview: mediaUrl('/previews/gravitational-lensing-1080p60.mp4'),
    summary:
      'Explore black holes and traversable wormholes, with light bending through curved spacetime in real time.',
  },
  {
    id: 'audio-viz',
    title: 'Audio Visualizer',
    href: 'https://visualizer.zaks.io/',
    image: mediaUrl('/previews/audio-visualizer-640-bounce-poster.png'),
    preview: mediaUrl('/previews/audio-visualizer-640-bounce.mp4'),
    summary:
      'One to four black holes driven by live microphone or system audio, with randomized presets that keep the visuals changing.',
  },
];
