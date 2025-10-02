"use client";

import { useEffect, useState } from 'react';
import { Layout, Card, List, Avatar, Typography, Space, Button, message } from 'antd';
import Navbar from './Navbar';
import Footer from './Footer';
import { API_BASE_URL } from '../config';

const { Title, Text } = Typography;

// Component to handle signed URL for each company
function CompanyListItem({ company }) {
  const [logoSignedUrl, setLogoSignedUrl] = useState(null);

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
    <List.Item actions={[<Button key="view" type="link" href={`/companies/${company._id}`}>View</Button>]}>
      <List.Item.Meta
        avatar={<Avatar src={logoSignedUrl} shape="square">{company.name?.charAt(0)?.toUpperCase()}</Avatar>}
        title={company.name}
        description={<Text type="secondary">{company.tagline || company.description || ''}</Text>}
      />
    </List.Item>
  );
}

export default function LikedCompaniesClient(){
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load(){
    try {
      setLoading(true);
      const token = localStorage.getItem('jf_token');
      if (!token) { window.location.href = '/login'; return; }
      const favRes = await fetch(`${API_BASE_URL}/favorites?$sort[createdAt]=-1`, { headers: { Authorization: `Bearer ${token}` } });
      const favJson = await favRes.json();
      const favs = Array.isArray(favJson) ? favJson : favJson.data || [];
      // fetch companies
      const companies = await Promise.all(favs.map(async f => {
        try {
          const r = await fetch(`${API_BASE_URL}/companies/${f.companyId}`, { headers: { Authorization: `Bearer ${token}` } });
          if (!r.ok) return null;
          const c = await r.json();
          return { favoriteId: f._id, ...c };
        } catch { return null; }
      }));
      setItems(companies.filter(Boolean));
    } catch (e) { message.error(e.message || 'Failed to load'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  return (
    <Layout>
      <Navbar />
      <Layout.Content style={{ padding: 24, maxWidth: 960, margin: '0 auto' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Title level={2} style={{ margin: 0 }}>Liked Companies</Title>
          <Card>
            <List
              loading={loading}
              dataSource={items}
              rowKey={c => c._id}
              renderItem={(c) => <CompanyListItem company={c} />}
            />
          </Card>
        </Space>
      </Layout.Content>
      <Footer />
    </Layout>
  );
}

