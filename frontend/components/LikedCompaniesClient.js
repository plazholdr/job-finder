"use client";

import { useEffect, useState } from 'react';
import { Card, List, Avatar, Typography, Button, Skeleton, Empty, App } from 'antd';
import Link from 'next/link';
import { API_BASE_URL } from '../config';

const { Title, Text, Paragraph } = Typography;

// Component to handle signed URL for each company
function CompanyListItem({ company, onUnlike }) {
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
    <List.Item
      extra={<Button onClick={() => onUnlike(company._id, company.favoriteId)}>Unlike</Button>}
    >
      <List.Item.Meta
        avatar={<Avatar src={logoSignedUrl} shape="square" size={64}>{company.name?.charAt(0)?.toUpperCase()}</Avatar>}
        title={
          <Link href={`/companies/${company._id}`} style={{ color: '#1677ff', fontSize: 16 }}>
            {company.name}
          </Link>
        }
        description={
          <div>
            {company.description && (
              <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 8 }}>
                {company.description}
              </Paragraph>
            )}
            {company.industry && (
              <Text type="secondary" style={{ fontSize: 14 }}>
                Industry: {company.industry}
              </Text>
            )}
          </div>
        }
      />
    </List.Item>
  );
}

export default function LikedCompaniesClient(){
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { message } = App.useApp();

  async function load(){
    try {
      setLoading(true);
      const token = localStorage.getItem('jf_token');
      if (!token) {
        message.info('Please sign in');
        window.location.href = '/login';
        return;
      }
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
    } catch (e) {
      message.error(e.message || 'Failed to load liked companies');
    } finally {
      setLoading(false);
    }
  }

  async function handleUnlike(companyId, favoriteId) {
    try {
      const token = localStorage.getItem('jf_token');
      if (!token) {
        message.info('Please sign in');
        return;
      }

      await fetch(`${API_BASE_URL}/favorites/${favoriteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      setItems(prev => prev.filter(it => it._id !== companyId));
      message.success('Removed from favorites');
    } catch (e) {
      message.error('Failed to unlike. Please try again.');
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) {
    return <Card><Skeleton active /></Card>;
  }

  if (!items.length) {
    return (
      <Card>
        <Empty description="No liked companies yet" />
      </Card>
    );
  }

  return (
    <Card>
      <List
        itemLayout="vertical"
        dataSource={items}
        rowKey={c => c._id}
        renderItem={(c) => <CompanyListItem company={c} onUnlike={handleUnlike} />}
      />
    </Card>
  );
}

