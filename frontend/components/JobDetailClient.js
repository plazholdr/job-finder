"use client";
import Navbar from "./Navbar";
import Footer from "./Footer";
import JobDetailActions from "./JobDetailActions";
import { Layout, Typography, Tag } from "antd";
import Link from "next/link";

export default function JobDetailClient({ job }) {
  return (
    <Layout>
      <Navbar />
      <Layout.Content style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
        {!job ? (
          <Typography.Title level={3}>Job not found</Typography.Title>
        ) : (
          <>
            <Typography.Title>
              {job.title}
              {job.status === 3 && (
                <Tag color="red" style={{ marginLeft: 12 }}>Past</Tag>
              )}
            </Typography.Title>
            {job.company?._id ? (
              <Typography.Paragraph type="secondary">
                <Link href={`/companies/${job.company._id}`}>{job.company.name}</Link>
              </Typography.Paragraph>
            ) : (
              <Typography.Paragraph type="secondary">{job.company?.name}</Typography.Paragraph>
            )}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              {(job.locations || []).map((l, i) => <Tag key={i}>{l}</Tag>)}
            </div>
            <Typography.Paragraph>{job.description}</Typography.Paragraph>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <JobDetailActions jobId={job._id} />
            </div>
          </>
        )}
      </Layout.Content>
      <Footer />
    </Layout>
  );
}

