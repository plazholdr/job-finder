"use client";
import { useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { Layout, Typography, Form, Input, Button, message } from "antd";
import { API_BASE_URL } from "../../config";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  async function onFinish(values) {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/authentication`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strategy: 'local', ...values }),
      });
      if (!res.ok) throw new Error('Login failed');
      const data = await res.json();
      localStorage.setItem('jf_token', data.accessToken);
      message.success('Signed in');
      window.location.href = '/';
    } catch (e) {
      message.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <Navbar />
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
      </Layout.Content>
      <Footer />
    </Layout>
  );
}

