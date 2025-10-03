"use client";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import LikedCompaniesClient from "../../components/LikedCompaniesClient";
import { Layout, Typography } from "antd";

export default function LikedCompaniesPage() {
  return (
    <Layout>
      <Navbar />
      <Layout.Content style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
        <Typography.Title level={3} style={{ marginBottom: 16 }}>Liked Companies</Typography.Title>
        <LikedCompaniesClient />
      </Layout.Content>
      <Footer />
    </Layout>
  );
}

