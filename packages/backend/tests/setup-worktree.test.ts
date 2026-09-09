import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('worktree setup', () => {
  it('neverCopiesProductionEnvironmentFiles', async () => {
    const script = await readFile(new URL('../../../setup-worktree.sh', import.meta.url), 'utf8');

    expect(script).not.toContain('.env.production');
    expect(script).toContain('packages/backend/.env.development');
    expect(script).toContain('apps/web/.env.development');
  });
});
