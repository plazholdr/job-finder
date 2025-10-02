"use client";

import { useEffect, useState } from 'react';
import { Layout, Card, Table, Button, Space, Tag, Input, Segmented, message, Modal, Typography, Drawer } from 'antd';
import { PlusOutlined, EditOutlined, EyeOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined, ExportOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { API_BASE_URL } from '../../../config';
import { JobListingStatus, JobListingStatusConfig, JobListingStatusFilters } from '../../../constants/enums';

const { Title, Text } = Typography;

export default function CompanyJobsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
  const [viewingJob, setViewingJob] = useState(null);

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, statusFilter, searchText]);

  async function loadJobs() {
    try {
      setLoading(true);
      const token = localStorage.getItem('jf_token');
      if (!token) {
        message.error('Please sign in');
        router.push('/login');
        return;
      }

      console.log('📋 Loading jobs from API...');
      const res = await fetch(`${API_BASE_URL}/job-listings?$limit=1000&$sort[createdAt]=-1`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to load jobs');
      const data = await res.json();
      console.log('📋 Jobs loaded:', data);
      const jobList = Array.isArray(data) ? data : (data?.data || []);
      console.log('📋 Job list:', jobList);
      setJobs(jobList);
    } catch (error) {
      console.error('❌ Load jobs error:', error);
      message.error(error.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }

  function filterJobs() {
    let filtered = [...jobs];

    // Filter by status - "all" shows everything (no filter)
    if (statusFilter !== JobListingStatusFilters.ALL) {
      const statusMap = {
        [JobListingStatusFilters.DRAFT]: JobListingStatus.DRAFT,
        [JobListingStatusFilters.PENDING]: JobListingStatus.PENDING,
        [JobListingStatusFilters.ACTIVE]: JobListingStatus.ACTIVE,
        [JobListingStatusFilters.CLOSED]: JobListingStatus.CLOSED,
      };
      filtered = filtered.filter(j => j.status === statusMap[statusFilter]);
    }

    // Filter by search text
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(j =>
        j.title?.toLowerCase().includes(search) ||
        j.position?.toLowerCase().includes(search) ||
        j.profession?.toLowerCase().includes(search)
      );
    }

    setFilteredJobs(filtered);
  }

  function getStatusTag(status) {
    const config = JobListingStatusConfig[status] || { label: 'Unknown', color: 'default' };
    return <Tag color={config.color}>{config.label}</Tag>;
  }

  async function handleDelete(jobId) {
    Modal.confirm({
      title: 'Delete Job Listing',
      content: 'Are you sure you want to delete this job listing? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const token = localStorage.getItem('jf_token');
          const res = await fetch(`${API_BASE_URL}/job-listings/${jobId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) throw new Error('Failed to delete job');
          message.success('Job deleted successfully');
          loadJobs();
        } catch (error) {
          message.error(error.message || 'Failed to delete job');
        }
      },
    });
  }

  function exportToCSV() {
    const headers = ['Title', 'Position', 'Profession', 'Status', 'Location', 'Salary Range', 'Created At'];
    const rows = filteredJobs.map(j => [
      j.title || '',
      j.position || '',
      j.profession || '',
      ['Draft', 'Pending Final', 'Active', 'Closed', 'Pending Pre', 'Pre-Approved'][j.status] || '',
      `${j.location?.city || ''}, ${j.location?.state || ''}`.trim(),
      j.salaryRange ? `RM ${j.salaryRange.min || 0} - RM ${j.salaryRange.max || 0}` : '',
      j.createdAt ? new Date(j.createdAt).toLocaleDateString() : '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `job-listings-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          {record.position && <Text type="secondary" style={{ fontSize: 12 }}>{record.position}</Text>}
        </div>
      ),
    },
    {
      title: 'Profession',
      dataIndex: 'profession',
      key: 'profession',
    },
    {
      title: 'Location',
      key: 'location',
      render: (_, record) => (
        record.location?.city && record.location?.state
          ? `${record.location.city}, ${record.location.state}`
          : '-'
      ),
    },
    {
      title: 'Salary Range',
      key: 'salary',
      render: (_, record) => (
        record.salaryRange?.min && record.salaryRange?.max
          ? `RM ${record.salaryRange.min} - RM ${record.salaryRange.max}`
          : '-'
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setViewingJob(record);
              setViewDrawerOpen(true);
            }}
          >
            View
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => router.push(`/company/jobs/${record._id}/edit`)}
          >
            Edit
          </Button>
          {record.status === 0 && (
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record._id)}
            >
              Delete
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const statusCounts = {
    [JobListingStatusFilters.ALL]: jobs.length,
    [JobListingStatusFilters.DRAFT]: jobs.filter(j => j.status === JobListingStatus.DRAFT).length,
    [JobListingStatusFilters.PENDING]: jobs.filter(j => j.status === JobListingStatus.PENDING).length,
    [JobListingStatusFilters.ACTIVE]: jobs.filter(j => j.status === JobListingStatus.ACTIVE).length,
    [JobListingStatusFilters.CLOSED]: jobs.filter(j => j.status === JobListingStatus.CLOSED).length,
  };

  return (
    <Layout>
      <Navbar />
      <Layout.Content style={{ maxWidth: 1400, margin: '24px auto', padding: '0 16px' }}>
        <Card>
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Title level={2} style={{ margin: 0 }}>Job Management</Title>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push('/company/jobs/new')}>
                Create New Job
              </Button>
            </div>

            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Space wrap>
                <Segmented
                  options={[
                    { label: `All (${statusCounts[JobListingStatusFilters.ALL]})`, value: JobListingStatusFilters.ALL },
                    { label: `Draft (${statusCounts[JobListingStatusFilters.DRAFT]})`, value: JobListingStatusFilters.DRAFT },
                    { label: `Pending (${statusCounts[JobListingStatusFilters.PENDING]})`, value: JobListingStatusFilters.PENDING },
                    { label: `Active (${statusCounts[JobListingStatusFilters.ACTIVE]})`, value: JobListingStatusFilters.ACTIVE },
                    { label: `Closed (${statusCounts[JobListingStatusFilters.CLOSED]})`, value: JobListingStatusFilters.CLOSED },
                  ]}
                  value={statusFilter}
                  onChange={setStatusFilter}
                />
              </Space>

              <Space>
                <Input
                  placeholder="Search by title, position, or profession"
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 300 }}
                  allowClear
                />
                <Button icon={<ReloadOutlined />} onClick={loadJobs}>Refresh</Button>
                <Button icon={<ExportOutlined />} onClick={exportToCSV}>Export CSV</Button>
              </Space>
            </Space>
          </div>

          <Table
            columns={columns}
            dataSource={filteredJobs}
            rowKey="_id"
            loading={loading}
            pagination={{
              pageSize: 20,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} jobs`,
            }}
          />
        </Card>

        {/* View Job Drawer */}
        <Drawer
          title="Job Details"
          open={viewDrawerOpen}
          onClose={() => {
            setViewDrawerOpen(false);
            setViewingJob(null);
          }}
          width={600}
        >
          {viewingJob && (
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Text strong>Title:</Text>
                <div>{viewingJob.title}</div>
              </div>
              <div>
                <Text strong>Status:</Text>
                <div>{getStatusTag(viewingJob.status)}</div>
              </div>
              {(viewingJob.preApprovalRejectionReason || viewingJob.rejectionReason) && (
                <div style={{ padding: 12, background: '#fff1f0', border: '1px solid #ff4d4f', borderRadius: 6 }}>
                  <Text type="danger" strong>Rejection Reason:</Text>
                  <div style={{ marginTop: 8 }}>
                    {viewingJob.preApprovalRejectionReason || viewingJob.rejectionReason}
                  </div>
                </div>
              )}
              <div>
                <Text strong>Position:</Text>
                <div>{viewingJob.position || '-'}</div>
              </div>
              <div>
                <Text strong>Profession:</Text>
                <div>{viewingJob.profession || '-'}</div>
              </div>
              <div>
                <Text strong>Description:</Text>
                <div>{viewingJob.description || '-'}</div>
              </div>
              <div>
                <Text strong>Location:</Text>
                <div>
                  {viewingJob.location?.city && viewingJob.location?.state
                    ? `${viewingJob.location.city}, ${viewingJob.location.state}`
                    : '-'}
                </div>
              </div>
              <div>
                <Text strong>Salary Range:</Text>
                <div>
                  {viewingJob.salaryRange?.min && viewingJob.salaryRange?.max
                    ? `RM ${viewingJob.salaryRange.min} - RM ${viewingJob.salaryRange.max}`
                    : '-'}
                </div>
              </div>
            </Space>
          )}
        </Drawer>
      </Layout.Content>
      <Footer />
    </Layout>
  );
}

