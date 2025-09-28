"use client";

// Lightweight RUM: logs key Web Vitals and hydration timing to the console
// No external deps; safe to ship. Guarded by NEXT_PUBLIC_RUM=1 to enable in prod.
import { useEffect } from 'react';

export default function PerfVitalsClient() {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_RUM !== '1') return;

    const log = (name, value, extra = {}) => {
      // Keep one-line concise logs for quick scanning
      // Example: [RUM] LCP=1234ms element=h1 text="Welcome"
      const parts = [
        `[RUM] ${name}=${Math.round(value)}ms`,
        ...Object.entries(extra).map(([k,v]) => `${k}=${typeof v === 'string' ? JSON.stringify(v) : v}`)
      ];
      // eslint-disable-next-line no-console
      console.log(parts.join(' '));
    };

    // Navigation timing (TTFB/FCP heuristic)
    const nav = performance.getEntriesByType('navigation')[0];
    if (nav) {
      const ttfb = nav.responseStart; // time to first byte
      const fcp = performance.getEntriesByName('first-contentful-paint')[0]?.startTime;
      if (ttfb != null) log('TTFB', ttfb);
      if (fcp != null) log('FCP', fcp);
    }

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const last = entries[entries.length - 1];
      if (last) {
        const el = last.element;
        const preview = el?.textContent ? el.textContent.slice(0, 40) : undefined;
        log('LCP', last.startTime, { element: el?.tagName, text: preview });
      }
    });
    try { lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true }); } catch (_) {}

    // Cumulative Layout Shift
    let cls = 0;
    const clsObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) cls += entry.value;
      }
      log('CLS', cls);
    });
    try { clsObserver.observe({ type: 'layout-shift', buffered: true }); } catch (_) {}

    // INP (Interaction to Next Paint)
    const inpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const worst = entries.reduce((a, b) => (a?.duration || 0) > (b?.duration || 0) ? a : b, null);
      if (worst) log('INP', worst.duration, { name: worst.name });
    });
    try { inpObserver.observe({ type: 'event', buffered: true, durationThreshold: 40 }); } catch (_) {}

    // Hydration timing (best-effort)
    const start = performance.timeOrigin;
    const onHydrated = () => {
      const now = performance.now();
      log('Hydration', now, {});
    };
    if (document.readyState === 'complete') onHydrated();
    else window.addEventListener('load', onHydrated);

    return () => {
      try { lcpObserver.disconnect(); } catch (_) {}
      try { clsObserver.disconnect(); } catch (_) {}
      try { inpObserver.disconnect(); } catch (_) {}
      window.removeEventListener('load', onHydrated);
    };
  }, []);

  return null;
}

