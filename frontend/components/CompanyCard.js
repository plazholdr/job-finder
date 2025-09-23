"use client";
import { Card, Typography, Tag, Space } from 'antd';
import Link from 'next/link';
import Image from 'next/image';

export default function CompanyCard({ company }) {
  const logo = company.logoUrl || company.logo || company.imageUrl;
  const jobsCount = company.jobsCount ?? company.jobCount ?? company.internshipJobListingCount;
  return (
    <Card hoverable title={<Link href={`/companies/${company._id}`}>{company.name}</Link>}>
      <Space align="start" style={{ width: '100%' }}>
        {logo ? (
          <Image src={logo} alt={`${company.name} logo`} width={48} height={48} style={{ objectFit: 'contain', borderRadius: 8 }} />
        ) : (
          <div style={{ width:48, height:48, background:'#f0f0f0', borderRadius:8 }} />
        )}
        <div style={{ flex: 1 }}>
          <Typography.Text type="secondary">{company.industry || 'Industry'}</Typography.Text>
          <Typography.Paragraph ellipsis={{ rows: 2 }} style={{ marginTop: 8 }}>
            {company.description || '—'}
          </Typography.Paragraph>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {jobsCount != null && <Tag color="geekblue">{jobsCount} jobs</Tag>}
            {company.location && <Tag>{company.location}</Tag>}
          </div>
        </div>
      </Space>
    </Card>
  );
}

