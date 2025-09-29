"use client";
import { useEffect, useState, Suspense } from 'react';
import { Layout, Typography, Button, Alert, Space, message } from 'antd';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

import { API_BASE_URL } from '../../config';
import RegistrationHeader from '../../components/RegistrationHeader';

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
      if (!email) return;
      // Do not auto-verify without a token. Show instructions instead.
      if (!token) { setStatus('idle'); return; }
      try {
        const res = await fetch(`${API_BASE_URL}/email-verification`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, token })
        });
        const data = await res.json().catch(()=>({}));
        if (!res.ok) throw new Error(data?.message || 'Verification failed');
        setStatus('ok');
        message.success('Email verified!');
        setTimeout(() => { window.location.href = `/login?next=${encodeURIComponent(next)}`; }, 1000);
      } catch (e) {
        setError(e.message);
        setStatus('error');
      }
    }
    run();
  }, [email, next, token]);

  return (
    <>
      <RegistrationHeader />
      <Layout style={{ height: '100vh' }}>
        <Layout.Content style={{ display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{ maxWidth: 720, textAlign: 'center' }}>
            <Image src="/images/email-verification.png" alt="Email verification" width={400} height={400} style={{ objectFit: 'contain'}} />
          <Typography.Title>Verify your email</Typography.Title>

          {status === 'idle' && email && (
            <Space direction="vertical" style={{ width: '100%' }} size="medium">
              <Typography.Paragraph>
                We&apos;ve sent an email to <strong>{email}</strong> to verify your email address and activate your account. The link in the email will expire in 24 hours.
              </Typography.Paragraph>
              <Typography.Paragraph>
                <a
                  onClick={async (e) => {
                    e.preventDefault();
                    try {
                      const r = await fetch(`${API_BASE_URL}/email-verification`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
                      const j = await r.json().catch(()=>({}));
                      if (!r.ok) throw new Error(j?.message || 'Failed to send');
                      message.success('Verification email sent. Please check your inbox.');
                    } catch (e) {
                      message.error(e.message || 'Failed to send verification email');
                    }
                  }}
                  href="#"
                >
                  Click here
                </a> if you did not receive an email or would like to change the email address you signed up with.
              </Typography.Paragraph>
            </Space>
          )}

          {status === 'idle' && !email && (
            <Typography.Paragraph type="secondary">Processing your verification link...</Typography.Paragraph>
          )}

          {status === 'ok' && (
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <Alert type="success" message="Email verified" showIcon />
              <Typography.Paragraph>Please sign in to continue.</Typography.Paragraph>
              <Link href={nextLogin}><Button type="primary">Continue to sign in</Button></Link>
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
        </div>
        </Layout.Content>
      </Layout>
    </>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div />}>
      <VerifyInner />
    </Suspense>
  );
}

