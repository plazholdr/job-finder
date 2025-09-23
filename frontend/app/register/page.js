"use client";
import { useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { Layout, Typography, Form, Input, Button, message } from "antd";
import { API_BASE_URL } from "../../config";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);

  async function onFinish(values) {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error('Registration failed');
      message.success('Registered. You can sign in now.');
      window.location.href = '/login';
    } catch (e) {
      message.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <Navbar />
      <Layout.Content style={{ padding: 24, maxWidth: 480, margin: '0 auto' }}>
        <Typography.Title level={3}>Create account</Typography.Title>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="name" label="Full name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>Create account</Button>
          </Form.Item>
        </Form>
      </Layout.Content>
      <Footer />
    </Layout>
  );
}

