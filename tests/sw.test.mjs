import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};
function response(body = 'fresh', status = 200, type = 'basic') {
  const result = new Response(body, { status });
  Object.defineProperty(result, 'type', { value: type });
  return result;
}

function worker({ base = 'https://example.test/', fetch = async () => response(), entries = [], putGate } = {}) {
  const handlers = {}, timers = new Map(), puts = [], added = [];
  const stored = new Map(entries.map(([path, value]) => [new URL(path, base).href, value]));
  let timerId = 0;
  const cache = {
    async addAll(paths) { added.push(...paths); },
    async put(key, value) {
      if (putGate) await putGate;
      puts.push(key);
      stored.set(key, value);
    },
  };
  vm.runInNewContext(source, {
    URL, Response, fetch,
    setTimeout(callback, ms) { const id = ++timerId; timers.set(id, { callback, ms }); return id; },
    clearTimeout(id) { timers.delete(id); },
    self: {
      location: new URL('sw.js', base),
      addEventListener(name, callback) { handlers[name] = callback; },
      skipWaiting() {}, clients: { claim() {} },
    },
    caches: {
      async open() { return cache; },
      async match(request, options) {
        const target = new URL(typeof request === 'string' ? request : request.url);
        if (options?.ignoreSearch) target.search = '';
        for (const [key, value] of stored) {
          const candidate = new URL(key);
          if (options?.ignoreSearch) candidate.search = '';
          if (target.href === candidate.href) return value.clone();
        }
      },
    },
  });
  return {
    puts, added, timers,
    async install() { let work; handlers.install({ waitUntil(p) { work = p; } }); await work; },
    expire() {
      for (const [id, timer] of timers) {
        assert.equal(timer.ms, 3000);
        timers.delete(id);
        timer.callback();
      }
    },
    request(path, { mode = 'cors', method = 'GET' } = {}) {
      let result;
      const lifetime = [];
      handlers.fetch({
        request: { url: new URL(path, base).href, mode, method },
        respondWith(p) { result = p; }, waitUntil(p) { lifetime.push(p); },
      });
      return { result, done: Promise.all(lifetime) };
    },
  };
}

test('offline navigation with query parameters uses the saved start page', async () => {
  for (const base of ['https://example.test/', 'https://example.test/fasta/']) {
    const w = worker({ base, fetch: async () => { throw Error('offline'); }, entries: [['./', response('start')]] });
    for (const path of ['./?utm_source=x', './other?utm_source=x']) {
      const event = w.request(path, { mode: 'navigate' });
      assert.equal(await (await event.result).text(), 'start');
      await event.done;
    }
  }
});

test('offline navigation can match index.html while ignoring its query', async () => {
  const w = worker({ fetch: async () => { throw Error('offline'); }, entries: [['./index.html', response('index')]] });
  assert.equal(await (await w.request('./index.html?utm_source=x', { mode: 'navigate' }).result).text(), 'index');
});

test('404, 500 and non-basic responses are delivered but never cached', async () => {
  for (const [status, type] of [[404, 'basic'], [500, 'basic'], [200, 'cors'], [200, 'opaque']]) {
    const w = worker({ fetch: async () => response('network', status, type) });
    const event = w.request('./js/app.js');
    assert.equal((await event.result).status, status);
    await event.done;
    assert.deepEqual(w.puts, []);
  }
});

test('a hanging network returns the cached file at the three-second limit', async () => {
  const w = worker({ fetch: () => new Promise(() => {}), entries: [['./js/app.js', response('cached')]] });
  const event = w.request('./js/app.js');
  w.expire();
  assert.equal(await (await event.result).text(), 'cached');
});

test('late network response refreshes cache and waitUntil covers the write', async () => {
  const pending = deferred(), put = deferred();
  const w = worker({ fetch: () => pending.promise, putGate: put.promise, entries: [['./js/app.js', response('old')]] });
  const event = w.request('./js/app.js');
  w.expire();
  assert.equal(await (await event.result).text(), 'old');
  pending.resolve(response('new'));
  let finished = false;
  event.done.then(() => { finished = true; });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(finished, false);
  put.resolve();
  await event.done;
  assert.deepEqual(w.puts, ['https://example.test/js/app.js']);
});

test('without a cached file the request keeps waiting for the network', async () => {
  const pending = deferred();
  const w = worker({ fetch: () => pending.promise });
  const event = w.request('./js/app.js');
  w.expire();
  let finished = false;
  event.result.then(() => { finished = true; });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(finished, false);
  pending.resolve(response());
  assert.equal(await (await event.result).text(), 'fresh');
  await event.done;
});

test('offline cache misses return Response.error for assets and navigation', async () => {
  for (const mode of ['cors', 'navigate']) {
    const w = worker({ fetch: async () => { throw Error('offline'); } });
    const event = w.request('./unknown', { mode });
    const result = await event.result;
    assert.equal(result.type, 'error');
    assert.equal(result.status, 0);
    await event.done;
    assert.equal(w.timers.size, 0);
  }
});

test('only precached URLs are saved and navigation queries share one key', async () => {
  const w = worker();
  for (const [path, mode] of [['./js/app.js', 'cors'], ['./?utm_source=a', 'navigate'], ['./?utm_source=b', 'navigate'], ['./unknown', 'cors'], ['./other', 'navigate'], ['./js/app.js?v=1', 'cors']]) {
    const event = w.request(path, { mode });
    await event.result;
    await event.done;
  }
  assert.deepEqual(w.puts, ['https://example.test/js/app.js', 'https://example.test/', 'https://example.test/']);
  assert.equal(w.timers.size, 0);
});

test('relative precache paths and cache writes work in a subdirectory', async () => {
  const w = worker({ base: 'https://example.test/fasta/' });
  await w.install();
  assert.ok(w.added.length > 0);
  assert.ok(w.added.every(path => path.startsWith('./')));
  const event = w.request('./js/app.js');
  await event.result;
  await event.done;
  assert.deepEqual(w.puts, ['https://example.test/fasta/js/app.js']);
});

test('cross-origin lookalikes and non-GET requests are left to the browser', () => {
  const w = worker({ fetch: () => { throw Error('must not fetch'); } });
  assert.equal(w.request('https://example.test.attacker.test/js/app.js').result, undefined);
  assert.equal(w.request('./js/app.js', { method: 'POST' }).result, undefined);
});

test('cache write failure does not break a successful network response', async () => {
  const gate = deferred();
  const w = worker({ putGate: gate.promise });
  const event = w.request('./js/app.js');
  assert.equal(await (await event.result).text(), 'fresh');
  gate.reject(Error('quota'));
  await event.done;
});

test('every PRECACHE file exists, including the local font', () => {
  const list = JSON.parse(source.match(/const PRECACHE = (\[[\s\S]*?\]);/)[1].replace(/,\s*\]/, ']'));
  assert.ok(list.includes('./css/fonts.css') && list.includes('./fonts/outfit-latin.woff2'));
  for (const path of list) {
    if (path === './') continue;
    assert.doesNotThrow(() => readFileSync(new URL('../' + path.slice(2), import.meta.url)), path);
  }
});
