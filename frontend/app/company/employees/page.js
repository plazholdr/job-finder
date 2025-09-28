"use client";

import { useEffect, useState, useCallback } from 'react';
import { Layout, Typography, Card, Table, Tag, Space, Button, Drawer, message } from 'antd';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { API_BASE_URL } from '../../../config';
import dynamic from 'next/dynamic';

const { Title } = Typography;

const EmployeeDetails = dynamic(() => import('../../../components/company/EmployeeDetails'), { ssr: false, loading: () => <div /> });

const statusTag = (s) => {
  const map = { 0: { c: 'gold', t: 'Upcoming' }, 1: { c: 'blue', t: 'Ongoing' }, 2: { c: 'purple', t: 'Closure' }, 3: { c: 'green', t: 'Completed' }, 4: { c: 'red', t: 'Terminated' } };
  const m = map[s] || { c: 'default', t: String(s) };
  return <Tag color={m.c}>{m.t}</Tag>;
};

export default function CompanyEmployeesPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [viewing, setViewing] = useState(null);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('jf_token');
      if (!token) { message.info('Please sign in'); window.location.href = '/login'; return; }
      const res = await fetch(`${API_BASE_URL}/employment-records`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to load employees');
      const j = await res.json();
      const list = Array.isArray(j?.data) ? j.data : (Array.isArray(j) ? j : []);
      setItems(list);
    } catch (e) { message.error(e.message || 'Failed to load'); setItems([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const columns = [
    { title: 'Candidate', dataIndex: 'userId', key: 'userId' },
    { title: 'Job', dataIndex: 'jobListingId', key: 'jobListingId' },
    { title: 'Start', dataIndex: 'startDate', key: 'startDate', render: (d) => d ? new Date(d).toLocaleDateString() : '-' },
    { title: 'End', dataIndex: 'endDate', key: 'endDate', render: (d) => d ? new Date(d).toLocaleDateString() : '-' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: statusTag },
    { title: 'Actions', key: 'actions', render: (_, r) => (
      <Space>
        <Button size="small" onClick={() => { setViewing(r); setOpen(true); }}>View</Button>
      </Space>
    ) }
  ];

  return (
    <Layout>
      <Navbar />
      <Layout.Content style={{ padding: 24, minHeight: '80vh' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Title level={2} style={{ margin: 0 }}>Employees</Title>
            <Card>
              <Table rowKey={r => r._id || r.id} columns={columns} dataSource={items} loading={loading} pagination={{ pageSize: 10 }} />
            </Card>
          </Space>
        </div>
      </Layout.Content>
      <Footer />
      <Drawer title="Employment details" open={open} onClose={() => setOpen(false)} width={640}>
        {viewing ? <EmployeeDetails record={viewing} /> : null}
      </Drawer>
    </Layout>
  );
}

