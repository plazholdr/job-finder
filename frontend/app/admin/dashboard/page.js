"use client";
import { useEffect, useState } from 'react';
import { Layout, Row, Col, Card, Statistic, Table, Typography, Space, Button, message, Tag } from 'antd';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { API_BASE_URL } from '../../../config';

const { Title } = Typography;

export default function AdminDashboardPage() {
  const [counts, setCounts] = useState({ jobListings: { counts: {} }, companies: { counts: {} }, users: { counts: {} } });
  const [pendingJobs, setPendingJobs] = useState([]);
  const [pendingCompanies, setPendingCompanies] = useState([]);
  const [expiringJobs, setExpiringJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      const token = localStorage.getItem('jf_token');
      if (!token) { message.error('Please sign in as admin'); window.location.href = '/login'; return; }
      const headers = { 'Authorization': `Bearer ${token}` };

      const [ovrRes, pJobsRes, pCoRes, expJobsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin-dashboard/overview`, { headers }),
        fetch(`${API_BASE_URL}/admin/monitoring?type=pending_jobs`, { headers }),
        fetch(`${API_BASE_URL}/admin/monitoring?type=pending_companies`, { headers }),
        fetch(`${API_BASE_URL}/admin/monitoring?type=expiring_jobs`, { headers })
      ]);

      const overview = await ovrRes.json();
      const pJobs = await pJobsRes.json();
      const pCompanies = await pCoRes.json();
      const expJobs = await expJobsRes.json();

      setCounts(overview || {});
      setPendingJobs(Array.isArray(pJobs) ? pJobs : (pJobs?.data || []));
      setPendingCompanies(Array.isArray(pCompanies) ? pCompanies : (pCompanies?.data || []));
      setExpiringJobs(Array.isArray(expJobs) ? expJobs : (expJobs?.data || []));
    } catch (e) {
      message.error(e.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }

  const jl = counts.jobListings?.counts || {}; // { draft, pending, active, closed, total }
  const co = counts.companies?.counts || {}; // { pending, approved, rejected, total }
  const us = counts.users?.counts || {}; // { students, companies, admins }

  const jobsColumns = [
    { title: 'Title', dataIndex: 'title', key: 'title' },
    { title: 'Company', key: 'company', render: (_, r) => r.company?.name || r.companyName || '-' },
    { title: 'Submitted', dataIndex: 'submittedAt', key: 'submittedAt', render: (d) => d ? new Date(d).toLocaleString() : '-' },
  ];
  const companiesColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Registration No.', dataIndex: 'registrationNumber', key: 'registrationNumber' },
    { title: 'Submitted', dataIndex: 'submittedAt', key: 'submittedAt', render: (d) => d ? new Date(d).toLocaleDateString() : '-' },
  ];
  const expiringColumns = [
    { title: 'Title', dataIndex: 'title', key: 'title' },
    { title: 'Company', key: 'company', render: (_, r) => r.company?.name || r.companyName || '-' },
    { title: 'Expires', dataIndex: 'expiresAt', key: 'expiresAt', render: (d) => d ? new Date(d).toLocaleString() : '-' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => <Tag color={s===2?'green':s===1?'orange':s===3?'red':'default'}>{s===2?'Active':s===1?'Pending':s===3?'Past':'Draft'}</Tag> },
  ];

  return (
    <Layout>
      <Navbar />
      <Layout.Content style={{ padding: 24, minHeight: '80vh' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Title level={2} style={{ margin: 0 }}>Admin Dashboard</Title>
              <Button onClick={load}>Refresh</Button>
            </div>

            {/* Top stats */}
            <Row gutter={[16,16]}>
              <Col xs={24} sm={12} md={6}><Card loading={loading}><Statistic title="Jobs (Active)" value={jl.active ?? 0} /></Card></Col>
              <Col xs={24} sm={12} md={6}><Card loading={loading}><Statistic title="Jobs (Pending)" value={jl.pending ?? 0} /></Card></Col>
              <Col xs={24} sm={12} md={6}><Card loading={loading}><Statistic title="Companies (Pending)" value={co.pending ?? 0} /></Card></Col>
              <Col xs={24} sm={12} md={6}><Card loading={loading}><Statistic title="Users (Companies)" value={us.companies ?? 0} /></Card></Col>
            </Row>

            {/* Listings */}
            <Row gutter={[16,16]}>
              <Col xs={24} md={12}>
                <Card title="Pending Job Listings" extra={<a href="/admin/monitoring?type=pending_jobs" onClick={(e)=>{e.preventDefault(); window.location.href='/admin/dashboard';}}>View</a>}>
                  <Table size="small" rowKey="_id" columns={jobsColumns} dataSource={pendingJobs.slice(0,10)} pagination={false} loading={loading} />
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card title="Expiring Jobs (≤ 7 days)" extra={<a href="/admin/renewals" onClick={(e)=>{e.preventDefault(); window.location.href='/admin/renewals';}}>Renewals</a>}>
                  <Table size="small" rowKey="_id" columns={expiringColumns} dataSource={expiringJobs.slice(0,10)} pagination={false} loading={loading} />
                </Card>
              </Col>
            </Row>

            {/* Companies */}
            <Row gutter={[16,16]}>
              <Col xs={24}>
                <Card title="Companies Pending Verification" extra={<a href="/admin/companies" onClick={(e)=>{e.preventDefault(); window.location.href='/admin/companies';}}>Manage Companies</a>}>
                  <Table size="small" rowKey="_id" columns={companiesColumns} dataSource={pendingCompanies.slice(0,10)} pagination={false} loading={loading} />
                </Card>
              </Col>
            </Row>
          </Space>
        </div>
      </Layout.Content>
      <Footer />
    </Layout>
  );
}

