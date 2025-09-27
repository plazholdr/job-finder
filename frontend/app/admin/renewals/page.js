"use client";
import { useEffect, useState } from 'react';
import { Layout, Table, Button, Space, Tag, Typography, Card, message, Input, Segmented, Drawer, Descriptions } from 'antd';
import { CheckOutlined, ReloadOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { API_BASE_URL } from '../../../config';

const { Title } = Typography;

export default function AdminRenewalsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [expFilter, setExpFilter] = useState('all'); // all | 7 | 14 | 30
  const [viewing, setViewing] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      const token = localStorage.getItem('jf_token');
      if (!token) { message.error('Please sign in as admin'); window.location.href = '/login'; return; }

      // Find ACTIVE listings with renewal flag
      const res = await fetch(`${API_BASE_URL}/job-listings?status=2&renewal=true&$limit=100&$sort[renewalRequestedAt]=-1`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load renewal requests');
      const json = await res.json();
      const data = Array.isArray(json) ? json : (json?.data || []);
      setItems(data);
    } catch (e) {
      message.error(e.message || 'Failed to load');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function approveRenewal(record) {
    try {
      const token = localStorage.getItem('jf_token');
      const res = await fetch(`${API_BASE_URL}/job-listings/${record._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ approveRenewal: true })
      });
      if (!res.ok) throw new Error('Approval failed');
      message.success('Renewal approved');
      load();
    } catch (e) {
      message.error(e.message || 'Failed to approve');
    }
  }

  const columns = [
    { title: 'Title', dataIndex: 'title', key: 'title' },
    { title: 'Company', key: 'company', render: (_, r) => r.company?.name || r.companyName || '-' },
    { title: 'Expires', dataIndex: 'expiresAt', key: 'expiresAt', render: (d) => d ? new Date(d).toLocaleString() : '-' },
    { title: 'Requested', dataIndex: 'renewalRequestedAt', key: 'renewalRequestedAt', render: (d) => d ? new Date(d).toLocaleString() : '-' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => <Tag color={s===2?'green':s===1?'orange':s===3?'red':'default'}>{s===2?'Active':s===1?'Pending':s===3?'Past':'Draft'}</Tag> },
    { title: 'Actions', key: 'actions', render: (_, r) => (
      <Space>
        <Button size="small" icon={<EyeOutlined />} onClick={() => { setViewing(r); setDrawerOpen(true); }}>View</Button>
        <Button type="primary" size="small" icon={<CheckOutlined />} onClick={() => approveRenewal(r)}>Approve Renewal</Button>
      </Space>
    )}
  ];

  const filtered = items.filter(it => {
    const q = query.trim().toLowerCase();
    const matchQ = !q || it.title?.toLowerCase().includes(q) || it.company?.name?.toLowerCase().includes(q) || it.companyName?.toLowerCase().includes(q);
    if (!matchQ) return false;
    if (expFilter === 'all') return true;
    const days = Number(expFilter);
    if (!it.expiresAt) return false;
    const dLeft = Math.ceil((new Date(it.expiresAt) - new Date()) / 86400000);
    return dLeft <= days;
  });

  return (
    <Layout>
      <Navbar />
      <Layout.Content style={{ padding: 24, minHeight: '80vh' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Title level={2}>Renewal Requests</Title>
          <Card style={{ marginBottom: 16 }}>
            <Space wrap>
              <Input allowClear prefix={<SearchOutlined />} placeholder="Search title or company" value={query} onChange={(e) => setQuery(e.target.value)} style={{ width: 320 }} />
              <Segmented options={[{label:'All',value:'all'},{label:'≤ 7 days',value:'7'},{label:'≤ 14 days',value:'14'},{label:'≤ 30 days',value:'30'}]} value={expFilter} onChange={setExpFilter} />
              <Button icon={<ReloadOutlined />} onClick={load}>Refresh</Button>
            </Space>
          </Card>
          <Card>
            <Table rowKey="_id" columns={columns} dataSource={filtered} loading={loading} pagination={{ pageSize: 10 }} />
          </Card>
        </div>
        <Drawer title="Job details" open={drawerOpen} onClose={() => setDrawerOpen(false)} width={560}>
          {viewing && (
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Title">{viewing.title}</Descriptions.Item>
              <Descriptions.Item label="Company">{viewing.company?.name || viewing.companyName || '-'}</Descriptions.Item>
              <Descriptions.Item label="Expires">{viewing.expiresAt ? new Date(viewing.expiresAt).toLocaleString() : '-'}</Descriptions.Item>
              <Descriptions.Item label="Requested At">{viewing.renewalRequestedAt ? new Date(viewing.renewalRequestedAt).toLocaleString() : '-'}</Descriptions.Item>
              <Descriptions.Item label="Status">{viewing.status===2?'Active':viewing.status===1?'Pending':viewing.status===3?'Past':'Draft'}</Descriptions.Item>
              <Descriptions.Item label="Publish At">{viewing.publishAt ? new Date(viewing.publishAt).toLocaleString() : '-'}</Descriptions.Item>
              <Descriptions.Item label="Approved At">{viewing.approvedAt ? new Date(viewing.approvedAt).toLocaleString() : '-'}</Descriptions.Item>
              <Descriptions.Item label="Description">{viewing.description || '-'}</Descriptions.Item>
            </Descriptions>
          )}
        </Drawer>
      </Layout.Content>
      <Footer />
    </Layout>
  );
}

