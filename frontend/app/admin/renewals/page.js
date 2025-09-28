"use client";
import { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Typography, Card, message, Input, Segmented, Drawer } from 'antd';
import { recordToCSV } from '../../../utils/csv';
import { CheckOutlined, ReloadOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons';

import { API_BASE_URL } from '../../../config';
import dynamic from 'next/dynamic';
const AdminRenewalDetails = dynamic(() => import('../../../components/admin/AdminRenewalDetails'), { ssr: false });

const { Title } = Typography;

export default function AdminRenewalsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [expFilter, setExpFilter] = useState('all'); // all | 7 | 14 | 30
  const [viewing, setViewing] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => { load(); }, [query, expFilter]);

  async function load() {
    try {
      setLoading(true);
      const token = localStorage.getItem('jf_token');
      if (!token) { message.error('Please sign in as admin'); window.location.href = '/login'; return; }

      const params = new URLSearchParams({ type: 'renewal_requests' });
      const q = (query || '').trim();
      if (q) params.set('q', q);
      if (expFilter !== 'all') params.set('maxDays', String(Number(expFilter)));

      const res = await fetch(`${API_BASE_URL}/admin/monitoring?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load renewal requests');
      const data = await res.json();
      setItems(Array.isArray(data) ? data : (data?.data || []));
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

  // Items are server-filtered via /admin/monitoring?type=renewal_requests

  return (
    <div>
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
          <Table rowKey="_id" columns={columns} dataSource={items} loading={loading} pagination={{ pageSize: 10 }} />
        </Card>
      </div>
      <Drawer title="Job details" open={drawerOpen} onClose={() => setDrawerOpen(false)} width={560}>
        {viewing ? (
          <>
            <Space style={{ marginBottom: 12 }}>
              <Button onClick={() => {
                try {
                  const csv = recordToCSV(viewing);
                  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `renewal-${viewing._id || 'record'}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                } catch (e) { message.error('Export failed'); }
              }}>Export CSV</Button>
            </Space>
            <AdminRenewalDetails record={viewing} />
          </>
        ) : null}
      </Drawer>
    </div>
  );
}

