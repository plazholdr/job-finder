"use client";
import { Layout, Card, Typography, Button, Space, Result, Steps, Divider } from 'antd';
import { ClockCircleOutlined, MailOutlined, HomeOutlined, ReloadOutlined, LogoutOutlined } from '@ant-design/icons';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

const { Title, Paragraph, Text } = Typography;

export default function CompanyPendingApprovalPage() {
  function refreshStatus() { window.location.reload(); }
  function signOut() {
    try { localStorage.removeItem('jf_token'); } catch {}
    window.location.href = '/login';
  }

  return (
    <Layout>
      <Navbar />
      <Layout.Content style={{ padding: '48px 16px', minHeight: '80vh' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <Card bordered={false} style={{ marginBottom: 16, textAlign: 'center', background: 'linear-gradient(180deg,#fefcf5,#fff)' }}>
            <Result
              icon={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              title="Your company submission is under review"
              subTitle="Thanks for submitting your details and SSM Superform. Our admin team is reviewing your application."
            />
            <div style={{ maxWidth: 560, margin: '0 auto 8px' }}>
              <Steps current={1} items={[
                { title: 'Submitted' },
                { title: 'Under review' },
                { title: 'Approved' }
              ]} />
              <Paragraph type="secondary" style={{ marginTop: 12 }}>
                You will receive an email when the review is complete. Typical review time: 1–3 business days.
              </Paragraph>
              <Space>
                <Link href="/">
                  <Button type="primary" icon={<HomeOutlined />}>Go to homepage</Button>
                </Link>
                <Button icon={<ReloadOutlined />} onClick={refreshStatus}>Refresh status</Button>
                <Button icon={<LogoutOutlined />} onClick={signOut}>Sign out</Button>
              </Space>
            </div>
          </Card>

          <Card style={{ textAlign: 'left' }}>
            <Title level={4} style={{ marginTop: 0 }}>What happens next?</Title>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Paragraph>
                  <strong>1. Document Review</strong><br />
                  Our admin team will review your company information and SSM Superform document.
                </Paragraph>
              </div>
              <div>
                <Paragraph>
                  <strong>2. Verification</strong><br />
                  We&apos;ll validate your company registration details and may contact you if clarification is required.
                </Paragraph>
              </div>
              <div>
                <Paragraph>
                  <strong>3. Approval Notification</strong><br />
                  You&apos;ll receive an email once your company has been approved. After approval you can sign in and post internship opportunities.
                </Paragraph>
              </div>
            </Space>
            <Divider />
            <Paragraph>
              <Text strong>Need help?</Text> Contact our support team at <a href="mailto:admin@jobfinder.com">admin@jobfinder.com</a>.
            </Paragraph>
          </Card>
        </div>
      </Layout.Content>
      <Footer />
    </Layout>
  );
}
