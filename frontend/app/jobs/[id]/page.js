import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { Layout, Typography, Tag, Button, message } from "antd";
import { API_BASE_URL } from "../../../config";

async function getJob(id) {
  const res = await fetch(`${API_BASE_URL}/job-listings/${id}`, { next: { revalidate: 60 } });
  if (!res.ok) return null;
  return res.json();
}

export default async function JobDetail({ params }) {
  const job = await getJob(params.id);
  if (!job) {
    return (
      <Layout>
        <Navbar />
        <Layout.Content style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
          <Typography.Title level={3}>Job not found</Typography.Title>
        </Layout.Content>
        <Footer />
      </Layout>
    );
  }
  return (
    <Layout>
      <Navbar />
      <Layout.Content style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
        <Typography.Title>{job.title}</Typography.Title>
        <Typography.Paragraph type="secondary">{job.company?.name}</Typography.Paragraph>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {(job.locations || []).map((l, i) => <Tag key={i}>{l}</Tag>)}
        </div>
        <Typography.Paragraph>{job.description}</Typography.Paragraph>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <Button type="primary" onClick={() => message.info('Please sign in to apply')}>Apply</Button>
          <Button onClick={() => message.info('Please sign in to save')}>Save</Button>
          <Button onClick={() => message.info('Please sign in to like')}>Like</Button>
        </div>
      </Layout.Content>
      <Footer />
    </Layout>
  );
}

