"use client";
import { useState, Suspense } from "react";
import { useSearchParams } from 'next/navigation';
import Footer from "../../components/Footer";
import { Layout, Typography, Form, Input, Button, message, Modal } from "antd";
import Link from 'next/link';
import { API_BASE_URL } from "../../config";

function LoginInner() {
  const [loading, setLoading] = useState(false);
  const search = useSearchParams();
  const next = search?.get('next') || '';

  async function onFinish(values) {
    try {
      setLoading(true);
      // Always clear any existing token before attempting a new login to avoid stale session artifacts
      try { localStorage.removeItem('jf_token'); } catch {}

      const res = await fetch(`${API_BASE_URL}/authentication`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strategy: 'local', ...values }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        // Ensure no token remains on failure
        try { localStorage.removeItem('jf_token'); } catch {}

        // Handle company pending approval specifically (can be 403 or 500)
        if ((errorData.message || '').toLowerCase().includes('pending approval')) {
          Modal.warning({
            title: 'Company Pending Approval',
            content: errorData.message,
            maskClosable: false,
            closable: false,
            onOk: () => { window.location.href = '/company/pending-approval'; },
            onCancel: () => { window.location.href = '/company/pending-approval'; },
            okText: 'Go to Pending Page'
          });
          setTimeout(() => { window.location.href = '/company/pending-approval'; }, 2500);
          return;
        }

        throw new Error(errorData.message || 'Login failed');
      }

      const data = await res.json();
      localStorage.setItem('jf_token', data.accessToken);
      message.success('Signed in');

      // Always redirect to homepage after successful login
      const dest = next || '/';
      window.location.href = dest;
    } catch (e) {
      // Ensure token is cleared on any error
      try { localStorage.removeItem('jf_token'); } catch {}
      message.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <Layout.Content style={{ padding: 24, maxWidth: 420, margin: '0 auto' }}>
        <Typography.Title level={3}>Sign in</Typography.Title>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="email" label="Email" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>Sign in</Button>
          </Form.Item>
        </Form>
        <Typography.Paragraph style={{ textAlign: 'center' }}>
          <Link href="/forgot-password">Forgot your password?</Link>
        </Typography.Paragraph>
        <Typography.Paragraph style={{ textAlign: 'center' }}>
          <Link href="/register-company">Register as a company</Link>
        </Typography.Paragraph>
      </Layout.Content>
      <Footer />
    </Layout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div />}>
      <LoginInner />
    </Suspense>
  );
}


