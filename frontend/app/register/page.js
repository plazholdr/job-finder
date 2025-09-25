"use client";
import Footer from "../../components/Footer";
import { Layout, Typography } from "antd";
import RegisterWizard from "../../components/RegisterWizard";

export default function RegisterPage() {
  return (
    <Layout>
      <Layout.Content style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
        <Typography.Title level={3}>Create your account</Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginTop: -8 }}>
          Student/Intern registration — complete the steps below, then check your email for verification.
        </Typography.Paragraph>
        <RegisterWizard />
      </Layout.Content>
      <Footer />
    </Layout>
  );
}

