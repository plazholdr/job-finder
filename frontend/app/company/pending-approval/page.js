"use client";
import { Layout, Card, Typography, Button, Space, Result } from 'antd';
import { ClockCircleOutlined, MailOutlined, HomeOutlined } from '@ant-design/icons';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

const { Title, Paragraph } = Typography;

export default function CompanyPendingApprovalPage() {
  return (
    <Layout>
      <Navbar />
      <Layout.Content style={{ padding: '50px 24px', minHeight: '80vh' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <Result
            icon={<ClockCircleOutlined style={{ color: '#faad14' }} />}
            title="Company Approval Pending"
            subTitle="Your company registration has been submitted successfully and is currently under review by our admin team."
            extra={[
              <Card key="info" style={{ textAlign: 'left', marginBottom: 24 }}>
                <Title level={4}>What happens next?</Title>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div>
                    <Paragraph>
                      <strong>1. Document Review</strong><br />
                      Our admin team will review your company information and SSM Superform document.
                    </Paragraph>
                  </div>
                  <div>
                    <Paragraph>
                      <strong>2. Verification Process</strong><br />
                      We'll verify your company registration details and ensure all information is accurate.
                    </Paragraph>
                  </div>
                  <div>
                    <Paragraph>
                      <strong>3. Approval Notification</strong><br />
                      You'll receive an email notification once your company has been approved or if additional information is needed.
                    </Paragraph>
                  </div>
                  <div>
                    <Paragraph>
                      <strong>4. Access Granted</strong><br />
                      After approval, you can sign in and start posting internship opportunities.
                    </Paragraph>
                  </div>
                </Space>
              </Card>,
              <Space key="actions" size="middle">
                <Link href="/">
                  <Button type="primary" icon={<HomeOutlined />}>
                    Back to Homepage
                  </Button>
                </Link>
                <Link href="/login">
                  <Button icon={<MailOutlined />}>
                    Try Sign In
                  </Button>
                </Link>
              </Space>
            ]}
          />
          
          <Card style={{ marginTop: 24, textAlign: 'center' }}>
            <Title level={5}>Need Help?</Title>
            <Paragraph type="secondary">
              If you have any questions about the approval process or need to update your submission, 
              please contact our support team.
            </Paragraph>
            <Paragraph>
              <strong>Review Time:</strong> Typically 1-3 business days<br />
              <strong>Support:</strong> admin@jobfinder.com
            </Paragraph>
          </Card>
        </div>
      </Layout.Content>
      <Footer />
    </Layout>
  );
}
