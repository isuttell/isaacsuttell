import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { safeJsonLd } from './format';

describe('safeJsonLd', () => {
  test('escapes every HTML tag start without changing the JSON value', () => {
    const value = {
      ordinary: 'one < two',
      terminators: [
        '</script>',
        '</SCRIPT>',
        '</script >',
        '</script\t>',
        '</script\n>',
        '</script\f>',
        '</script\r\n>',
        '</script/>',
      ],
      markup: '<!-- comment --><script>alert(1)</script>',
    };

    const serialized = safeJsonLd(value);

    assert.equal(serialized.includes('<'), false);
    assert.deepEqual(JSON.parse(serialized), value);
  });
});
