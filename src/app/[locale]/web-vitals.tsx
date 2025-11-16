'use client';

import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Web Vitals]', metric);
    }

    // Send to analytics endpoint in production
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      // Example: send to your analytics endpoint
      // Uncomment and configure when ready
      /*
      const body = JSON.stringify({
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
        navigationType: metric.navigationType,
      });

      fetch('/api/vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      }).catch(console.error);
      */

      // For now, just use console in production too
      console.log('[Web Vitals]', metric.name, metric.value, metric.rating);
    }
  });

  return null;
}
