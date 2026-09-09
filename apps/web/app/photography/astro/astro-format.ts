export function formatExposure(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    throw new Error(`Invalid exposure duration: ${seconds}`);
  }

  const roundedSeconds = Math.round(seconds);
  const hours = Math.floor(roundedSeconds / 3600);
  const minutes = Math.floor((roundedSeconds % 3600) / 60);
  const remainingSeconds = roundedSeconds % 60;
  const parts: string[] = [];

  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (remainingSeconds > 0 || parts.length === 0) parts.push(`${remainingSeconds}s`);

  return parts.join(' ');
}

export function formatAstroDate(value: string): string {
  const parsed = new Date(`${value}T00:00:00Z`);

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== value
  ) {
    throw new Error(`Invalid capture date: ${value}`);
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parsed);
}

export function formatDateRange(from: string | null, to: string | null): string | null {
  if (from === null && to === null) return null;
  if (from === null) return formatAstroDate(to as string);
  if (to === null || to === from) return formatAstroDate(from);

  return `${formatAstroDate(from)} to ${formatAstroDate(to)}`;
}

export function formatDecimal(value: number, digits = 2): string {
  if (!Number.isFinite(value)) throw new Error(`Invalid numeric value: ${value}`);
  return value.toFixed(digits).replace(/\.0+$|(?<=\.\d*[1-9])0+$/, '');
}
