"use client";

// Last resort: replaces the root layout itself, so it must render its own <html> and <body>
// and cannot rely on the app's global stylesheet being loaded.
export default function GlobalError({ reset }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: '100dvh', display: 'grid', placeItems: 'center', background: '#0D1625', color: '#E8E3D8', fontFamily: 'system-ui, sans-serif' }}>
        <main role="alert" style={{ maxWidth: 420, padding: 24, textAlign: 'center' }}>
          <h1 style={{ fontSize: 22, fontWeight: 600 }}>Bravely hit a problem</h1>
          <p style={{ color: '#A9B3BD', lineHeight: 1.6 }}>Please reload the page. If it keeps happening, try again in a few minutes.</p>
          <button type="button" onClick={() => reset()} style={{ marginTop: 16, height: 40, padding: '0 18px', borderRadius: 8, border: 0, background: '#3FB7C5', color: '#0D1625', fontWeight: 600, cursor: 'pointer' }}>
            Reload
          </button>
        </main>
      </body>
    </html>
  );
}
