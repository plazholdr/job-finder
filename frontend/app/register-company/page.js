"use client";
import { useState } from 'react';
import { Layout, Typography, Form, Input, Button, message } from 'antd';
import Footer from '../../components/Footer';
import { API_BASE_URL } from '../../config';

export default function RegisterCompanyPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  function onValuesChange(changed) {
    if ('username' in changed) {
      const v = String(changed.username || '').trim();
      const isEmail = v.includes('@');
      if (isEmail && !form.getFieldValue('email')) {
        form.setFieldsValue({ email: v });
      }
    }
  }

  async function onFinish(values) {
    const username = String(values.username || '').trim();
    const email = username.includes('@') ? username : String(values.email || '').trim();
    if (!email) { message.error('Email is required'); return; }
    try {
      setLoading(true);
      // Create company user account
      const res = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: values.password, role: 'company', username: username || undefined })
      });
      const data = await res.json().catch(()=>({}));
      if (!res.ok) throw new Error(data?.message || 'Failed to register');

      // Send verification email
      try {
        const verifyRes = await fetch(`${API_BASE_URL}/email-verification`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email })
        });
        if (!verifyRes.ok) {
          const verifyData = await verifyRes.json().catch(() => ({}));
          console.warn('Email verification request failed:', verifyData?.message);
        }
      } catch (e) {
        console.warn('Email verification request failed:', e.message);
      }

      message.success('Account created. Check your email to verify your account.');
      // Guide them to verification page with instructions (no token needed, they'll enter the code)
      window.location.href = `/verify-email?email=${encodeURIComponent(email)}&forCompany=1`;
    } catch (e) {
      // Better error messages for common issues
      let errorMsg = e.message;
      if (e.message.includes('email: value already exists')) {
        errorMsg = 'An account with this email already exists. Please use a different email or try signing in.';
      } else if (e.message.includes('Conflict')) {
        errorMsg = 'This email is already registered. Please sign in or use a different email.';
      } else if (e.message.includes('validation')) {
        errorMsg = 'Please check your input and try again.';
      }
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <Layout.Content style={{ padding: 24, maxWidth: 520, margin: '0 auto' }}>
        <Typography.Title level={3}>Register your company admin account</Typography.Title>
        <Typography.Paragraph type="secondary">
          Use your work email. After verifying your email, you&apos;ll complete your company information and submit verification.
        </Typography.Paragraph>
        <Form layout="vertical" form={form} onValuesChange={onValuesChange} onFinish={onFinish}>
          <Form.Item name="username" label="Username (can be your email)" rules={[{ required: true }]}>
            <Input placeholder="username or email" />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true, min: 6 }]}>
            <Input.Password placeholder="Minimum 6 characters" />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Please enter a valid email (required if username is not an email)' }]}>
            <Input placeholder="name@company.com" />
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

