// Mätskript för fastatimer.se (körs i Playwright via browser_run_code_unsafe).
// Gör 3 kalla laddningar (tom cache, ny profil) per profil och returnerar råvärden.
// Ta medianen per mätvärde och jämför mot docs/benchmark/baseline.json.
async (page) => {
  const browser = page.context().browser();
  const URL = 'https://fastatimer.se/';
  const init = () => {
    window.__m = { cls: 0, lcp: null, tbt: 0, longtasks: 0 };
    new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__m.cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver(l => { const e = l.getEntries().pop(); if (e) window.__m.lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver(l => { for (const e of l.getEntries()) { window.__m.longtasks++; window.__m.tbt += Math.max(0, e.duration - 50); } }).observe({ type: 'longtask', buffered: true });
  };
  const profiles = {
    desktop: { ctx: { viewport: { width: 1350, height: 940 } }, net: null, cpu: 1 },
    mobile: {
      ctx: { viewport: { width: 375, height: 812 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true,
        userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36' },
      // Ungefär Lighthouse "Slow 4G": 150 ms latens, 1,6 Mbit/s ner, 750 kbit/s upp, 4x långsammare CPU
      net: { offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8 }, cpu: 4,
    },
  };
  const out = {};
  for (const [name, p] of Object.entries(profiles)) {
    out[name] = [];
    for (let run = 0; run < 3; run++) {
      const ctx = await browser.newContext(p.ctx);
      const pg = await ctx.newPage();
      await pg.addInitScript(init);
      const cdp = await ctx.newCDPSession(pg);
      await cdp.send('Network.enable');
      await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
      if (p.net) await cdp.send('Network.emulateNetworkConditions', p.net);
      if (p.cpu > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: p.cpu });
      const reqs = {};
      cdp.on('Network.responseReceived', e => { reqs[e.requestId] = { url: e.response.url, type: e.type, size: 0 }; });
      cdp.on('Network.loadingFinished', e => { if (reqs[e.requestId]) reqs[e.requestId].size = e.encodedDataLength; });
      await pg.goto(URL, { waitUntil: 'load' });
      await pg.waitForTimeout(3000);
      const m = await pg.evaluate(() => {
        const n = performance.getEntriesByType('navigation')[0];
        const fcp = performance.getEntriesByType('paint').find(x => x.name === 'first-contentful-paint');
        return { ttfb: n.responseStart - n.requestStart, fcp: fcp ? fcp.startTime : null, lcp: window.__m.lcp,
          cls: window.__m.cls, tbt: window.__m.tbt, domInteractive: n.domInteractive, domComplete: n.domComplete, load: n.loadEventEnd };
      });
      out[name].push({ m, reqs: Object.values(reqs) });
      await ctx.close();
    }
  }
  return JSON.stringify(out);
}
