"use client";

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body style={{ padding: 24, fontFamily: 'sans-serif' }}>
        <h2>Something went wrong</h2>
        {error?.message && <p style={{ color: '#666' }}>{error.message}</p>}
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  );
}

