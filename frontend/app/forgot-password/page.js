"use client";
import { useState } from 'react';
import { Layout, Typography, Form, Input, Button, message, Alert } from 'antd';
import Link from 'next/link';
import Footer from '../../components/Footer';
import { API_BASE_URL } from '../../config';

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onFinish(values) {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/password-reset`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values)
      });
      if (!res.ok) throw new Error('Failed to send reset email');
      setDone(true);
      message.success('If an account exists, a reset email has been sent.');
    } catch (e) {
      message.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <Layout.Content style={{ padding: 24, maxWidth: 480, margin: '0 auto' }}>
        <Typography.Title level={3}>Forgot your password?</Typography.Title>
        <Typography.Paragraph type="secondary">
          Enter your email and we will send you a link to reset your password. The link expires in 30 minutes.
        </Typography.Paragraph>
        {done && (
          <Alert type="success" showIcon style={{ marginBottom: 16 }}
            message="Check your email"
            description="We sent a password reset link if an account exists for that email." />
        )}
        <Form layout="vertical" onFinish={onFinish} disabled={loading || done}>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input placeholder="name@example.com" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>Send reset link</Button>
          </Form.Item>
        </Form>
        <Typography.Paragraph style={{ textAlign: 'center' }}>
          <Link href="/login">Back to sign in</Link>
        </Typography.Paragraph>
      </Layout.Content>
      <Footer />
    </Layout>
  );
}

