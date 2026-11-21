import Link from 'next/link';

export const metadata = { title: 'Page not found — Bravely' };

export default function NotFound() {
  return (
    <main style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 24, background: 'var(--bv-s0)' }}>
      <div style={{ maxWidth: 420, textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 12, letterSpacing: '0.14em', color: 'var(--bv-brand)', marginBottom: 12 }}>404</p>
        <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>We couldn&apos;t find that page</h1>
        <p style={{ color: 'var(--bv-t2)', lineHeight: 1.6, marginBottom: 20 }}>The link may be old or the page may have moved.</p>
        <Link href="/" className="bv-btn bv-btn--primary">Back to Bravely</Link>
      </div>
    </main>
  );
}
