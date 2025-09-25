"use client";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import LikedJobsClient from "../../components/LikedJobsClient";
import { Layout, Typography } from "antd";

export default function LikedJobsPage() {
  return (
    <Layout>
      <Navbar />
      <Layout.Content style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
        <Typography.Title level={3} style={{ marginBottom: 16 }}>Liked Jobs</Typography.Title>
        <LikedJobsClient />
      </Layout.Content>
      <Footer />
    </Layout>
  );
}

