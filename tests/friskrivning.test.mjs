import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const read = file => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const source = read('js/modals.js');
const fn = source.slice(source.indexOf('export function openFriskrivning()'), source.indexOf('// Read a number field.')).replace('export ', '');
function harness({ saved = null, unavailable = false } = {}) {
  const result = { opened: 0, removed: 0, focused: 0, notices: [], value: saved };
  let accept;
  const button = { addEventListener: (_, callback) => { accept = callback; }, focus: () => result.focused++ };
  const context = {
    localStorage: {
      getItem: key => { assert.equal(key, 'fasta-friskrivning'); if (unavailable) throw Error('denied'); return result.value; },
      setItem: (key, value) => { assert.equal(key, 'fasta-friskrivning'); if (unavailable) throw Error('denied'); result.value = value; },
    },
    document: { querySelector: () => result.opened > result.removed },
    openModal: (html, options) => {
      assert.equal(options.dismissible, false);
      assert.match(html, /aria-describedby="friskrivning-text"/);
      result.opened++;
      return { querySelector: () => button, remove: () => result.removed++ };
    },
    showNotice: text => result.notices.push(text),
  };
  runInNewContext(fn, context);
  return { result, open: () => context.openFriskrivning(), accept: () => accept() };
}

test('friskrivningen är ordagrant den godkända texten', () => {
  const approved = read('docs/kunskap/integritet.md').match(/### juridik\.friskrivning[\s\S]*?\n> ([^\r\n]+)/)[1];
  assert.equal(fn.match(/<p id="friskrivning-text">([^<]+)<\/p>/)[1], approved);
});

test('första start kräver aktivt svar och sparar datum i separat nyckel', () => {
  const h = harness();
  h.open(); h.open();
  assert.equal(h.result.opened, 1);
  assert.equal(h.result.focused, 1);
  assert.equal(h.result.value, null);
  h.accept();
  assert.ok(Number.isFinite(Date.parse(h.result.value)));
  assert.equal(h.result.removed, 1);
  h.open();
  assert.equal(h.result.opened, 1);
});

test('befintligt kvitto hindrar rutan och otillgänglig lagring låser inte användaren', () => {
  const saved = harness({ saved: '2026-10-01T12:00:00.000Z' });
  saved.open();
  assert.equal(saved.result.opened, 0);
  const denied = harness({ unavailable: true });
  denied.open(); denied.accept();
  assert.equal(denied.result.removed, 1);
  assert.equal(denied.result.notices.length, 1);
  denied.open();
  assert.equal(denied.result.opened, 2);
});
