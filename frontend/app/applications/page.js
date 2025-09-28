"use client";
import { useEffect, useMemo, useState } from 'react';
import { Layout, Card, Table, Space, Typography, Button, Tag, message } from 'antd';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { API_BASE_URL } from '../../config';

const { Title } = Typography;

const statusText = (s) => ({0:'Applied',1:'Shortlisted',2:'Interview',3:'Pending Acceptance',4:'Accepted',5:'Rejected',6:'Withdrawn',7:'Not Attending'}[s] || String(s));

export default function MyApplicationsPage(){
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load(){
    try {
      setLoading(true);
      const token = localStorage.getItem('jf_token');
      if (!token) { window.location.href = '/login'; return; }
      const res = await fetch(`${API_BASE_URL}/applications?$sort[createdAt]=-1`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      const data = Array.isArray(json) ? json : (json?.data || []);
      setItems(data);
    } catch (e) { message.error(e.message || 'Failed to load'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function withdraw(id){
    try {
      const token = localStorage.getItem('jf_token');
      await fetch(`${API_BASE_URL}/applications/${id}`, { method: 'PATCH', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ action: 'withdraw' }) });
      message.success('Application withdrawn');
      load();
    } catch (e) { message.error(e.message || 'Failed'); }
  }

  const columns = [
    { title: 'Job', key: 'job', render: (_, r) => r.jobTitle || r.job?.title || r.jobListingId },
    { title: 'Company', key: 'company', render: (_, r) => r.companyName || r.company?.name || r.companyId },
    { title: 'Submitted', dataIndex: 'createdAt', render: (d) => d ? new Date(d).toLocaleString() : '-' },
    { title: 'Validity', key: 'validity', render: (_, r) => r.validityUntil ? new Date(r.validityUntil).toLocaleDateString() : '-' },
    { title: 'Status', dataIndex: 'status', render: (s) => <Tag>{statusText(s)}</Tag> },
    { title: 'Action', key: 'action', render: (_, r) => (
      <Space>
        {[0,1,2,3].includes(r.status) && <Button danger size="small" onClick={() => withdraw(r._id)}>Withdraw</Button>}
      </Space>
    ) }
  ];

  return (
    <Layout>
      <Navbar />
      <Layout.Content style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Title level={2} style={{ margin: 0 }}>My Applications</Title>
          <Card>
            <Table rowKey="_id" columns={columns} dataSource={items} loading={loading} pagination={{ pageSize: 10 }} />
          </Card>
        </Space>
      </Layout.Content>
      <Footer />
    </Layout>
  );
}

