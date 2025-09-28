"use client";
import { useEffect, useMemo, useState } from 'react';
import { Layout, Card, Table, Space, Typography, Button, Tag, message, Tabs, Modal } from 'antd';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { API_BASE_URL } from '../../config';
import Link from 'next/link';

const { Title } = Typography;

const InviteStatus = { 0: 'Invitation', 1: 'Accepted', 2: 'Not Interested', 3: 'Expired' };

const tabs = [
  { key: 'pending', label: 'Invitation', statuses: [0] },
  { key: 'notInterested', label: 'Not Interested', statuses: [2] }
];

export default function InvitationsPage(){
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeKey, setActiveKey] = useState('pending');

  async function load(){
    try {
      setLoading(true);
      const token = localStorage.getItem('jf_token');
      if (!token) { window.location.href = '/login'; return; }
      const res = await fetch(`${API_BASE_URL}/invites?$sort[createdAt]=-1`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      const data = Array.isArray(json) ? json : (json?.data || []);
      setItems(data);
    } catch (e) { message.error(e.message || 'Failed to load'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const def = tabs.find(t => t.key === activeKey)?.statuses || [];
    return items.filter(i => def.includes(i.status));
  }, [items, activeKey]);

  async function markNotInterested(invite){
    try {
      const token = localStorage.getItem('jf_token');
      await fetch(`${API_BASE_URL}/invites/${invite._id}`, { method: 'PATCH', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ status: 2 }) });
      message.success('Invitation marked as Not Interested');
      load();
    } catch (e) { message.error(e.message || 'Failed'); }
  }

  const columns = [
    { title: 'Company', key: 'company', render: (_, r) => r.companyName || r.company?.name || r.companyId },
    { title: 'Type', dataIndex: 'type' },
    { title: 'Invitation date', dataIndex: 'createdAt', render: (d) => d ? new Date(d).toLocaleString() : '-' },
    { title: 'Invitation status', dataIndex: 'status', render: (s) => <Tag>{InviteStatus[s] || s}</Tag> },
    { title: 'Actions', key: 'actions', render: (_, r) => (
      <Space>
        {r.status === 0 && <Button onClick={()=>markNotInterested(r)} danger size="small">Not interested</Button>}
        <Link href={`/companies/${r.companyId}`}><Button size="small">View company</Button></Link>
      </Space>
    ) }
  ];

  return (
    <Layout>
      <Navbar />
      <Layout.Content style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Title level={2} style={{ margin: 0 }}>Invitations</Title>
          <Card>
            <Tabs activeKey={activeKey} onChange={setActiveKey} items={tabs} />
            <Table rowKey="_id" columns={columns} dataSource={filtered} loading={loading} pagination={{ pageSize: 10 }} />
          </Card>
        </Space>
      </Layout.Content>
      <Footer />
    </Layout>
  );
}

