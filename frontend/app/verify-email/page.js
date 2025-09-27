"use client";
import { useEffect, useState, Suspense } from 'react';
import { Layout, Typography, Button, Alert, Space, message } from 'antd';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Footer from '../../components/Footer';
import { API_BASE_URL } from '../../config';

function VerifyInner() {
  const search = useSearchParams();
  const token = search.get('token') || '';
  const email = search.get('email') || '';
  const forCompany = search.get('forCompany') === '1';
  const [status, setStatus] = useState('idle'); // idle | ok | error
  const [error, setError] = useState('');

  const next = forCompany ? '/company/setup' : '/';
  const nextLogin = `/login?next=${encodeURIComponent(next)}`;

  useEffect(() => {
    async function run() {
      // Skip token validation - just verify by email for company users
      if (!email) return;

      if (forCompany) {
        // For company users, verify email with token and redirect to setup
        try {
          if (!token) throw new Error('Invalid or missing verification token');
          const res = await fetch(`${API_BASE_URL}/email-verification`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, token })
          });
          const data = await res.json().catch(()=>({}));
          if (!res.ok) throw new Error(data?.message || 'Verification failed');
          setStatus('ok');
          message.success('Email verified! Redirecting to company setup...');
          setTimeout(() => { window.location.href = `/login?next=${encodeURIComponent(next)}`; }, 1000);
        } catch (e) {
          setError(e.message);
          setStatus('error');
        }
      } else {
        // For regular users, just redirect to login
        setStatus('ok');
        setTimeout(() => { window.location.href = `/login?next=${encodeURIComponent(next)}`; }, 500);
      }
    }
    run();
  }, [email, next, forCompany]);

  return (
    <Layout>
      <Layout.Content style={{ padding: 24, maxWidth: 560, margin: '0 auto' }}>
        <Typography.Title level={3}>Verify your email</Typography.Title>
        {status === 'idle' && email && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Typography.Paragraph type="secondary">
              We sent a verification email to <strong>{email}</strong>. Please check your email and click the verification link.
            </Typography.Paragraph>
            <Typography.Paragraph>
              If you don&apos;t see the email, check your spam folder or try requesting a new verification email after signing in.
            </Typography.Paragraph>
            <Link href={nextLogin}>
              <Button type="primary">Continue to sign in</Button>
            </Link>
          </Space>
        )}
        {status === 'idle' && !email && (
          <Typography.Paragraph type="secondary">Processing your verification link...</Typography.Paragraph>
        )}
        {status === 'ok' && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Alert type="success" message="Email verified" showIcon />
            <Typography.Paragraph>
              Please sign in to continue.
            </Typography.Paragraph>
            <Link href={nextLogin}>
              <Button type="primary">Continue to sign in</Button>
            </Link>
          </Space>
        )}
        {status === 'error' && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Alert type="error" showIcon message="Verification failed" description={error} />
            <Typography.Paragraph>If the link expired, you can request a new verification email below.</Typography.Paragraph>
            <Space>
              <Button onClick={async ()=>{
                try {
                  if (!email) throw new Error('No email found');
                  const r = await fetch(`${API_BASE_URL}/email-verification`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
                  const j = await r.json().catch(()=>({}));
                  if (!r.ok) throw new Error(j?.message || 'Failed to send');
                  message.success('Verification email sent. Please check your inbox.');
                } catch (e) {
                  message.error(e.message || 'Failed to send verification email');
                }
              }}>Resend verification email</Button>
              <Link href="/login"><Button>Back to sign in</Button></Link>
            </Space>
          </Space>
        )}
      </Layout.Content>
      <Footer />
    </Layout>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div />}>
      <VerifyInner />
    </Suspense>
  );
}

