"use client";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import JobsExplorer from "../../components/JobsExplorer";
import { Layout, Typography } from "antd";
import { Suspense } from "react";

export default function JobsPage() {
  return (
    <Layout>
      <Navbar />
      <Layout.Content style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
        <Typography.Title level={3} style={{ marginBottom: 16 }}>All Jobs</Typography.Title>
        <Suspense fallback={null}>
          <JobsExplorer />
        </Suspense>
      </Layout.Content>
      <Footer />
    </Layout>
  );
}

