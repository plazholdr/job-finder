"use client";
import { useEffect, useMemo, useState } from 'react';
import { Layout, Table, Typography, Space, Tag, Button, Input, DatePicker, message } from 'antd';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { API_BASE_URL } from '../../../config';

const { Title } = Typography;

export default function CompanyApplicationsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      const token = localStorage.getItem('jf_token');
      if (!token) { message.error('Please sign in'); window.location.href = '/login'; return; }
      const res = await fetch(`${API_BASE_URL}/applications?$sort[createdAt]=-1`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      const data = Array.isArray(json) ? json : (json?.data || []);
      setItems(data);
    } catch (e) {
      message.error(e.message || 'Failed to load applications');
    } finally { setLoading(false); }
  }

  const statusTag = (s) => {
    const map = {
      0: { text: 'New', color: 'blue' },
      1: { text: 'Shortlisted', color: 'cyan' },
      2: { text: 'Interview', color: 'purple' },
      3: { text: 'Pending Acceptance', color: 'gold' },
      4: { text: 'Hired', color: 'green' },
      5: { text: 'Rejected', color: 'red' },
      6: { text: 'Withdrawn', color: 'default' },
      7: { text: 'Not Attending', color: 'default' }
    };
    const m = map[s];
    return m ? <Tag color={m.color}>{m.text}</Tag> : <Tag>{String(s)}</Tag>;
  };

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return items;
    return items.filter((r) => {
      const cand = (r.candidateName || r.candidate?.fullName || '').toLowerCase();
      const job = (r.jobTitle || r.job?.title || '').toLowerCase();
      return cand.includes(qq) || job.includes(qq);
    });
  }, [items, q]);

  const columns = [
    { title: 'Candidate', key: 'candidate', render: (_, r) => r.candidateName || r.candidate?.fullName || '-' },
    { title: 'Job', key: 'job', render: (_, r) => r.jobTitle || r.job?.title || '-' },
    { title: 'Submitted', dataIndex: 'createdAt', render: (d) => d ? new Date(d).toLocaleString() : '-' },
    { title: 'Validity', key: 'validity', render: (_, r) => r.validityUntil ? new Date(r.validityUntil).toLocaleDateString() : '-' },
    { title: 'Status', dataIndex: 'status', render: (s) => statusTag(s) },
    { title: 'Action', key: 'action', render: (_, r) => (
        <Space>
          <Button type="link" onClick={() => { window.location.href = `/company/applications/${r._id}`; }}>Open</Button>
        </Space>
      )
    }
  ];

  return (
    <Layout>
      <Navbar />
      <Layout.Content style={{ padding: 24, minHeight: '80vh' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <Title level={2} style={{ margin: 0 }}>Applications</Title>
              <Space>
                <Input.Search placeholder="Search candidate or job" allowClear value={q} onChange={(e)=>setQ(e.target.value)} onSearch={(v)=>setQ(v)} />
                <Button onClick={load}>Refresh</Button>
              </Space>
            </div>

            <Table rowKey="_id" loading={loading} columns={columns} dataSource={filtered} pagination={{ pageSize: 10 }} />
          </Space>
        </div>
      </Layout.Content>
      <Footer />
    </Layout>
  );
}

