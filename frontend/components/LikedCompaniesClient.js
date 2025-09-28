"use client";

import { useEffect, useState } from 'react';
import { Layout, Card, List, Avatar, Typography, Space, Button, message } from 'antd';
import Navbar from './Navbar';
import Footer from './Footer';
import { API_BASE_URL } from '../config';

const { Title, Text } = Typography;

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
              renderItem={(c) => (
                <List.Item actions={[<Button type="link" href={`/companies/${c._id}`}>View</Button>] }>
                  <List.Item.Meta
                    avatar={<Avatar src={c.logoUrl} shape="square" />}
                    title={c.name}
                    description={<Text type="secondary">{c.tagline || c.description || ''}</Text>}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Space>
      </Layout.Content>
      <Footer />
    </Layout>
  );
}

