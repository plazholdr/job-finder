"use client";

import { useEffect, useState } from "react";

export default function ShareViewerClient({ token, apiBase }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let aborted = false;
    async function run() {
      try {
        setLoading(true);
        const res = await fetch(`${apiBase}/shares/${token}`);
        if (!res.ok) throw new Error("Not found");
        const json = await res.json();
        if (!aborted) setData(json);
      } catch (e) {
        if (!aborted) setError(e.message || "Failed to load");
      } finally {
        if (!aborted) setLoading(false);
      }
    }
    run();
    return () => { aborted = true; };
  }, [token, apiBase]);

  if (loading) return <div>Loading…</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  return (
    <pre style={{ whiteSpace: 'pre-wrap', overflowX: 'auto' }}>
      {JSON.stringify(data?.snapshot || data, null, 2)}
    </pre>
  );
}

