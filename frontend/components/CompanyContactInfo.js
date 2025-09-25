"use client";
import { Card, Typography } from 'antd';
import {
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  GlobalOutlined
} from '@ant-design/icons';

const { Title } = Typography;

export default function CompanyContactInfo({ company }) {
  const formatAddress = (address) => {
    if (!address) return '—';

    if (address.fullAddress) {
      return address.fullAddress;
    }

    const parts = [
      address.street,
      address.city,
      address.state,
      address.zipCode,
      address.country
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(', ') : '—';
  };

  return (
    <Card title={<Title level={4} style={{ margin: 0 }}>Company Information</Title>}>
      <div className="company-info-grid">
        <div className="company-info-item">
          <div className="company-info-label">
            <FileTextOutlined /> <span>Registration Number</span>
          </div>
          <div className="company-info-value">{company.registrationNumber || '—'}</div>
        </div>

        <div className="company-info-item">
          <div className="company-info-label">
            <GlobalOutlined /> <span>Business Nature</span>
          </div>
          <div className="company-info-value">{(company.industry || '').toString().replace(/\s+/g, ' ').trim() || '—'}</div>
        </div>

        <div className="company-info-item">
          <div className="company-info-label">
            <MailOutlined /> <span>Email</span>
          </div>
          <div className="company-info-value">
            {company.email ? (
              <a href={`mailto:${company.email}`} className="company-info-link">{company.email}</a>
            ) : '—'}
          </div>
        </div>

        <div className="company-info-item">
          <div className="company-info-label">
            <PhoneOutlined /> <span>Phone</span>
          </div>
          <div className="company-info-value">
            {company.phone ? (
              <a href={`tel:${company.phone}`} className="company-info-link">{company.phone}</a>
            ) : '—'}
          </div>
        </div>

        <div className="company-info-item">
          <div className="company-info-label">
            <GlobalOutlined /> <span>Website</span>
          </div>
          <div className="company-info-value">
            {company.website ? (
              <a
                href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="company-info-link"
              >
                {company.website}
              </a>
            ) : '—'}
          </div>
        </div>

        <div className="company-info-item company-info-span2">
          <div className="company-info-label">
            <EnvironmentOutlined /> <span>Full Address</span>
          </div>
          <div className="company-info-value">{formatAddress(company.address)}</div>
        </div>
      </div>
    </Card>
  );
}
