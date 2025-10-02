"use client";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Layout, Row, Col, Typography, Card, Avatar, Tag, Space } from "antd";
import {
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined,
  TeamOutlined,
  UserOutlined
} from "@ant-design/icons";
import CompanyActions from "./CompanyActions";
import CompanyInternshipsList from "./CompanyInternshipsList";
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

const { Title, Text, Paragraph } = Typography;

export default function CompanyDetailClient({ company, jobs }) {
  const [logoSignedUrl, setLogoSignedUrl] = useState(null);

  // Generate signed URL for logo display
  useEffect(() => {
    async function loadLogo() {
      let logoUrl = company?.logo || company?.logoUrl;
      if (!logoUrl && company?.logoKey) {
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
  }, [company?.logo, company?.logoUrl, company?.logoKey]);

  if (!company) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Navbar />
        <Layout.Content style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
          <Card>
            <Title level={3}>Company unavailable</Title>
            <Text type="secondary">This company may have been removed or is no longer available.</Text>
          </Card>
        </Layout.Content>
        <Footer />
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Navbar />
      <Layout.Content style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
        <Row gutter={[24, 24]}>
          {/* Left: Company Header & Details */}
          <Col xs={24} lg={16}>
            {/* Company Header Card */}
            <Card style={{ border: '0.5px solid lightgray', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', marginBottom: 16 }}>
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} md={16}>
                  <div style={{ display: 'flex', alignItems: 'start', gap: 16 }}>
                    <Avatar
                      src={logoSignedUrl}
                      shape="square"
                      size={80}
                      style={{
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #e9ecef',
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: '#6c757d',
                        flexShrink: 0
                      }}
                    >
                      {company.name?.charAt(0)?.toUpperCase() || 'C'}
                    </Avatar>

                    <div style={{ flex: 1 }}>
                      <Title level={2} style={{ margin: 0, marginBottom: 8 }}>
                        {company.name}
                      </Title>

                      <Space wrap style={{ marginBottom: 8 }}>
                        {company.industry && (
                          <Tag color="blue" style={{ fontSize: '14px', padding: '4px 8px' }}>
                            {company.industry}
                          </Tag>
                        )}
                        {company.size && (
                          <Tag icon={<TeamOutlined />} style={{ fontSize: '14px', padding: '4px 8px' }}>
                            {company.size}
                          </Tag>
                        )}
                      </Space>

                      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8 }}>
                        {company.address?.city && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <EnvironmentOutlined style={{ color: '#666' }} />
                            <Text>{company.address.city}{company.address.state && `, ${company.address.state}`}</Text>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Col>

                <Col xs={24} md={8}>
                  <div style={{ textAlign: 'right' }}>
                    <CompanyActions companyId={company._id} />
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Main Content Card */}
            <Card style={{ border: '0.5px solid lightgray' }}>
              {/* Company Overview Section */}
              <div style={{ marginBottom: 40 }}>
                <Title level={3} style={{ color: 'black', marginBottom: 16, fontSize: 20, fontWeight: 600, borderBottom: '2px solid black', paddingBottom: 8, display: 'inline-block' }}>
                  Company Overview
                </Title>
                <Paragraph style={{ fontSize: 16, lineHeight: 1.8, color: '#333', marginBottom: 0 }}>
                  {company.description || 'No description provided.'}
                </Paragraph>
              </div>

              {/* Contact Information Section */}
              <div style={{ marginBottom: 40 }}>
                <Title level={3} style={{ color: 'black', marginBottom: 16, fontSize: 20, fontWeight: 600, borderBottom: '2px solid black', paddingBottom: 8, display: 'inline-block' }}>
                  Contact Information
                </Title>

                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  {company.website && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <GlobalOutlined style={{ fontSize: 18, color: '#666' }} />
                      <a
                        href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: 16 }}
                      >
                        {company.website}
                      </a>
                    </div>
                  )}

                  {company.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <MailOutlined style={{ fontSize: 18, color: '#666' }} />
                      <a href={`mailto:${company.email}`} style={{ fontSize: 16 }}>
                        {company.email}
                      </a>
                    </div>
                  )}

                  {company.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <PhoneOutlined style={{ fontSize: 18, color: '#666' }} />
                      <Text style={{ fontSize: 16 }}>{company.phone}</Text>
                    </div>
                  )}

                  {company.address?.fullAddress && (
                    <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
                      <EnvironmentOutlined style={{ fontSize: 18, color: '#666', marginTop: 4 }} />
                      <Text style={{ fontSize: 16 }}>{company.address.fullAddress}</Text>
                    </div>
                  )}
                </Space>
              </div>

              {/* Point of Contact Section */}
              {(company.picName || company.picEmail || company.picPhone) && (
                <div style={{ marginBottom: 0 }}>
                  <Title level={3} style={{ color: 'black', marginBottom: 16, fontSize: 20, fontWeight: 600, borderBottom: '2px solid black', paddingBottom: 8, display: 'inline-block' }}>
                    Point of Contact
                  </Title>

                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    {company.picName && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <UserOutlined style={{ fontSize: 18, color: '#666' }} />
                        <Text style={{ fontSize: 16 }}>{company.picName}</Text>
                      </div>
                    )}

                    {company.picEmail && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <MailOutlined style={{ fontSize: 18, color: '#666' }} />
                        <a href={`mailto:${company.picEmail}`} style={{ fontSize: 16 }}>
                          {company.picEmail}
                        </a>
                      </div>
                    )}

                    {company.picPhone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <PhoneOutlined style={{ fontSize: 18, color: '#666' }} />
                        <Text style={{ fontSize: 16 }}>{company.picPhone}</Text>
                      </div>
                    )}
                  </Space>
                </div>
              )}
            </Card>
          </Col>

          {/* Right: Internships List */}
          <Col xs={24} lg={8}>
            <CompanyInternshipsList company={company} jobs={jobs} />
          </Col>
        </Row>
      </Layout.Content>
      <Footer />
    </Layout>
  );
}

