"use client";
import { useEffect } from 'react';
import Link from 'next/link';

// Catches render errors in any route below the root layout, so one broken page never blanks the whole app.
export default function RouteError({ error, reset }) {
  useEffect(() => {
    // TODO(monitoring): send to an error tracker (for example Sentry) with error.digest.
    console.error(error);
  }, [error]);

  return (
    <main role="alert" style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 24, background: 'var(--bv-s0)' }}>
      <div style={{ maxWidth: 440, textAlign: 'center' }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Something went wrong</h1>
        <p style={{ color: 'var(--bv-t2)', lineHeight: 1.6, marginBottom: 20 }}>
          This page hit an unexpected problem. Your work on other pages is not affected.
          {error?.digest ? ` Reference: ${error.digest}.` : ''}
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button type="button" className="bv-btn bv-btn--primary" onClick={() => reset()}>Try again</button>
          <Link href="/" className="bv-btn bv-btn--secondary">Go home</Link>
        </div>
      </div>
    </main>
  );
}
