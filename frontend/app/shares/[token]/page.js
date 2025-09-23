import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { Layout, Typography, Card } from "antd";
import { API_BASE_URL } from "../../../config";

async function getShare(token) {
  const res = await fetch(`${API_BASE_URL}/shares/${token}`, { next: { revalidate: 60 } });
  if (!res.ok) return null;
  return res.json();
}

export default async function SharePreview({ params }) {
  const data = await getShare(params.token);
  return (
    <Layout>
      <Navbar />
      <Layout.Content style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
        <Typography.Title level={3}>Shared item</Typography.Title>
        {data ? (
          <Card title={data.type?.toUpperCase() || 'Item'}>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(data.snapshot || data, null, 2)}</pre>
          </Card>
        ) : (
          <Typography.Text>Not found</Typography.Text>
        )}
      </Layout.Content>
      <Footer />
    </Layout>
  );
}

