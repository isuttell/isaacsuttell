import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { describe, test } from 'node:test';
import ts from 'typescript';

async function readConfiguredMatchers(): Promise<string[]> {
  const sourceText = await readFile(new URL('./proxy.ts', import.meta.url), 'utf8');
  const source = ts.createSourceFile('proxy.ts', sourceText, ts.ScriptTarget.Latest, true);

  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue;

    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || declaration.name.text !== 'config') continue;
      if (!declaration.initializer || !ts.isObjectLiteralExpression(declaration.initializer)) break;

      const matcher = declaration.initializer.properties.find(
        (property): property is ts.PropertyAssignment =>
          ts.isPropertyAssignment(property) &&
          ts.isIdentifier(property.name) &&
          property.name.text === 'matcher'
      );
      if (!matcher || !ts.isArrayLiteralExpression(matcher.initializer)) break;

      return matcher.initializer.elements.map((element) => {
        assert.ok(ts.isStringLiteral(element), 'proxy matchers must be static string literals');
        return element.text;
      });
    }
  }

  throw new Error('Could not find a static proxy matcher config');
}

describe('proxy matcher', () => {
  test('protects dotted admin paths and skips static assets', async () => {
    const { unstable_doesMiddlewareMatch } = await import('next/experimental/testing/server');
    const config = { matcher: await readConfiguredMatchers() };
    const matches = (url: string) => unstable_doesMiddlewareMatch({ config, nextConfig: {}, url });

    assert.equal(matches('/admin'), true);
    assert.equal(matches('/admin/blog/post.with.dots/edit'), true);
    assert.equal(matches('/admin/export.csv'), true);
    assert.equal(matches('/login'), true);
    assert.equal(matches('/about'), true);
    assert.equal(matches('/api/auth'), true);

    assert.equal(matches('/blackhole-audio-visualizer.webp'), false);
    assert.equal(matches('/photography/astro/2020-10-11-M31_p.jpg'), false);
    assert.equal(matches('/_next/static/chunks/app.js'), false);
    assert.equal(matches('/_next/image'), false);
    assert.equal(matches('/favicon.ico'), false);
    assert.equal(matches('/robots.txt'), false);
    assert.equal(matches('/sitemap.xml'), false);
  });
});
