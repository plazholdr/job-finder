"use client";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Layout, Row, Col, Space, Typography } from "antd";
import CompanyActions from "./CompanyActions";
import CompanyHeader from "./CompanyHeader";
import CompanyContactInfo from "./CompanyContactInfo";
import CompanyInternshipsList from "./CompanyInternshipsList";

export default function CompanyDetailClient({ company, jobs }) {
  const notFound = !company;
  return (
    <Layout>
      <Navbar />
      <Layout.Content style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
        {notFound ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <Typography.Title level={3}>Company not found</Typography.Title>
            <Typography.Paragraph>
              The company you&apos;re looking for doesn&apos;t exist or has been removed.
            </Typography.Paragraph>
          </div>
        ) : (
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            {/* Company Header */}
            <CompanyHeader company={company} jobsCount={Array.isArray(jobs) ? jobs.length : 0} />

            {/* Main Content Grid */}
            <Row gutter={[24, 24]}>
              {/* Left Column - Company Details */}
              <Col xs={24} lg={8}>
                <Space direction="vertical" size="large" style={{ width: "100%" }}>
                  <CompanyContactInfo company={company} />
                  <CompanyActions companyId={company._id} />
                </Space>
              </Col>

              {/* Right Column - Internships */}
              <Col xs={24} lg={16}>
                <CompanyInternshipsList company={company} jobs={jobs} />
              </Col>
            </Row>
          </Space>
        )}
      </Layout.Content>
      <Footer />
    </Layout>
  );
}

