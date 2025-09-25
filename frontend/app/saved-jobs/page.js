"use client";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SavedJobsClient from "../../components/SavedJobsClient";
import { Layout, Typography } from "antd";

export default function SavedJobsPage() {
  return (
    <Layout>
      <Navbar />
      <Layout.Content style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
        <Typography.Title level={3} style={{ marginBottom: 16 }}>Saved Jobs</Typography.Title>
        <SavedJobsClient />
      </Layout.Content>
      <Footer />
    </Layout>
  );
}

