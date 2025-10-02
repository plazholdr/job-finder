"use client";
import { Card, Typography, Space, Tag, Button, Avatar } from 'antd';
import { GlobalOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

const { Title, Text, Paragraph } = Typography;

export default function CompanyHeader({ company, jobsCount }) {
  const [logoSignedUrl, setLogoSignedUrl] = useState(null);

  // Generate signed URL for logo display
  useEffect(() => {
    async function loadLogo() {
      // Construct URL from logoKey if available, otherwise use logo/logoUrl
      let logoUrl = company.logo || company.logoUrl;
      if (!logoUrl && company.logoKey) {
        logoUrl = `${process.env.NEXT_PUBLIC_STORAGE_URL || 'https://ap-southeast-mys1.oss.ips1cloud.com/job-finder-bucket'}/${company.logoKey}`;
      }

      if (logoUrl) {
        try {
          const res = await fetch(`${API_BASE_URL}/signed-url?url=${encodeURIComponent(logoUrl)}`);
          if (res.ok) {
            const data = await res.json();
            setLogoSignedUrl(data.signedUrl);
          } else {
            setLogoSignedUrl(logoUrl);
          }
        } catch (e) {
          setLogoSignedUrl(logoUrl);
        }
      }
    }
    loadLogo();
  }, [company.logo, company.logoUrl, company.logoKey]);

  return (
    <Card className="company-header-card">
      <Space align="start" size="large" style={{ width: '100%' }}>
        {/* Company Logo */}
        <div style={{ flexShrink: 0 }}>
          <Avatar
            src={logoSignedUrl}
            shape="square"
            size={80}
            style={{
              backgroundColor: '#f8f9fa',
              border: '1px solid #e9ecef',
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#6c757d'
            }}
          >
            {company.name?.charAt(0)?.toUpperCase() || 'C'}
          </Avatar>
        </div>

        {/* Company Info */}
        <div style={{ flex: 1 }}>
          <Title level={2} style={{ margin: 0, marginBottom: 8 }}>
            {company.name}
          </Title>

          <Space wrap style={{ marginBottom: 12 }}>
            {company.industry && (
              <Tag color="blue" style={{ fontSize: '14px', padding: '4px 8px' }}>
                {company.industry}
              </Tag>
            )}
            {company.address?.city && (
              <Tag icon={<EnvironmentOutlined />} style={{ fontSize: '14px', padding: '4px 8px' }}>
                {company.address.city}
                {company.address.state && `, ${company.address.state}`}
              </Tag>
            )}
            {(() => { const count = (typeof jobsCount === 'number') ? jobsCount : (company.internships?.length || 0); return count > 0 ? (
              <Tag color="green" style={{ fontSize: '14px', padding: '4px 8px' }}>
                {count} Internship{count !== 1 ? 's' : ''}
              </Tag>
            ) : null; })()}
          </Space>

          {company.website && (
            <div style={{ marginBottom: 12 }}>
              <Button
                type="link"
                icon={<GlobalOutlined />}
                href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                target="_blank"
                style={{ padding: 0, height: 'auto' }}
              >
                Visit Website
              </Button>
            </div>
          )}

          {company.description && (
            <Paragraph
              style={{
                marginBottom: 0,
                color: '#666',
                fontSize: '14px',
                lineHeight: '1.6'
              }}
              ellipsis={{ rows: 3, expandable: true, symbol: 'Read more' }}
            >
              {company.description}
            </Paragraph>
          )}
        </div>
      </Space>
    </Card>
  );
}
