import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import dynamic from "next/dynamic";
import { API_BASE_URL } from "../../../config";

const ShareViewerClient = dynamic(() => import("../../../components/shares/ShareViewerClient"), { loading: () => <div style={{ padding: 16 }}>Loading…</div> });

export default function SharePreview({ params }) {
  return (
    <div>
      <Navbar />
      <main style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>Shared item</h1>
        <div style={{ marginTop: 12, border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, background: 'white' }}>
          <ShareViewerClient token={params.token} apiBase={API_BASE_URL} />
        </div>
      </main>
      <Footer />
    </div>
  );
}

