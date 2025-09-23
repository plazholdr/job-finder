import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { Layout, Typography, Divider } from "antd";
import { API_BASE_URL } from "../../../config";
import CompanyActions from "../../../components/CompanyActions";

async function getCompany(id) {
  const res = await fetch(`${API_BASE_URL}/companies/${id}`, { next: { revalidate: 60 } });
  if (!res.ok) return null;
  return res.json();
}

export default async function CompanyDetail({ params }) {
  const company = await getCompany(params.id);
  if (!company) {
    return (
      <Layout>
        <Navbar />
        <Layout.Content style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
          <Typography.Title level={3}>Company not found</Typography.Title>
        </Layout.Content>
        <Footer />
      </Layout>
    );
  }
  return (
    <Layout>
      <Navbar />
      <Layout.Content style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
        <Typography.Title>{company.name}</Typography.Title>
        <Typography.Paragraph type="secondary">{company.industry}</Typography.Paragraph>
        <Typography.Paragraph>{company.description || '—'}</Typography.Paragraph>
        <Divider />
        <CompanyActions companyId={company._id} />
      </Layout.Content>
      <Footer />
    </Layout>
  );
}

