"use client";
import { Card, Typography, Space, Tag, Button } from 'antd';
import { GlobalOutlined, EnvironmentOutlined } from '@ant-design/icons';
import Image from 'next/image';

const { Title, Text, Paragraph } = Typography;

export default function CompanyHeader({ company, jobsCount }) {
  const logoUrl = company.logoKey ? `${process.env.NEXT_PUBLIC_STORAGE_URL}/${company.logoKey}` : null;

  return (
    <Card className="company-header-card">
      <Space align="start" size="large" style={{ width: '100%' }}>
        {/* Company Logo */}
        <div style={{ flexShrink: 0 }}>
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={`${company.name} logo`}
              width={80}
              height={80}
              style={{
                objectFit: 'contain',
                borderRadius: 8,
                border: '1px solid #f0f0f0'
              }}
            />
          ) : (
            <div style={{
              width: 80,
              height: 80,
              background: '#f8f9fa',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #e9ecef',
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#6c757d'
            }}>
              {company.name?.charAt(0)?.toUpperCase() || 'C'}
            </div>
          )}
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
