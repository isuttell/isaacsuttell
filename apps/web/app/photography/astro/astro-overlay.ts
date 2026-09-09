export const overlayTransition =
  'transition-opacity duration-500 ease-out motion-reduce:transition-none';

export function labelOpacity(pinned: boolean, revealed: boolean): string {
  if (pinned) return 'opacity-100';
  return revealed ? 'opacity-80' : 'opacity-0';
}

export function gridOpacity(pinned: boolean, revealed: boolean): string {
  if (pinned) return 'opacity-100';
  return revealed ? 'opacity-45' : 'opacity-0';
}
