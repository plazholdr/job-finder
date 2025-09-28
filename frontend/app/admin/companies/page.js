"use client";
import { useState, useEffect } from 'react';
import { Layout, Table, Button, Space, Tag, message, Modal, Typography, Card, Descriptions, Segmented } from 'antd';
import { CheckOutlined, CloseOutlined, EyeOutlined } from '@ant-design/icons';

import { API_BASE_URL } from '../../../config';
import dynamic from 'next/dynamic';
const AdminCompaniesTable = dynamic(() => import('../../../components/admin/AdminCompaniesTable'), { ssr: false, loading: () => <div /> });


const { Title } = Typography;

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all'); // all|pending|approved|rejected

  useEffect(() => {
    loadCompanies();
  }, [statusFilter]);

  function statusToQueryValue(filter) {
    if (filter === 'pending') return 0;
    if (filter === 'approved') return 1;
    if (filter === 'rejected') return 2;
    return undefined;
  }

  async function loadCompanies() {
    try {
      const token = localStorage.getItem('jf_token');
      if (!token) {
        message.error('Please sign in as admin');
        window.location.href = '/login';
        return;
      }

      const vs = statusToQueryValue(statusFilter);
      const qs = new URLSearchParams();
      qs.set('$sort[submittedAt]','-1');
      qs.set('$limit','200');
      if (vs !== undefined) qs.set('verifiedStatus', String(vs));
      const res = await fetch(`${API_BASE_URL}/companies?${qs.toString()}` , {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error('Failed to load companies');
      }

      const data = await res.json();
      setCompanies(Array.isArray(data) ? data : (data?.data || []));
    } catch (error) {
      console.error('Error loading companies:', error);
      message.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  }

  async function approveCompany(companyId) {
    try {
      const token = localStorage.getItem('jf_token');
      const res = await fetch(`${API_BASE_URL}/companies/${companyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          verifiedStatus: 1,
          reviewedAt: new Date().toISOString()
        })
      });

      if (!res.ok) {
        throw new Error('Failed to approve company');
      }

      message.success('Company approved successfully');
      loadCompanies();
    } catch (error) {
      console.error('Error approving company:', error);
      message.error('Failed to approve company');
    }
  }

  async function rejectCompany(companyId) {
    try {
      const token = localStorage.getItem('jf_token');
      const res = await fetch(`${API_BASE_URL}/companies/${companyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          verifiedStatus: 2,
          reviewedAt: new Date().toISOString(),
          rejectionReason: 'Rejected by admin'
        })
      });

      if (!res.ok) {
        throw new Error('Failed to reject company');
      }

      message.success('Company rejected');
      loadCompanies();
    } catch (error) {
      console.error('Error rejecting company:', error);
      message.error('Failed to reject company');
    }
  }

  function getStatusTag(status) {
    const s = typeof status === 'string' ? status : ({0:'pending',1:'approved',2:'rejected'}[status] ?? 'unknown');
    if (s === 'pending') return <Tag color="orange">Pending</Tag>;
    if (s === 'approved') return <Tag color="green">Approved</Tag>;
    if (s === 'rejected') return <Tag color="red">Rejected</Tag>;
    return <Tag>Unknown</Tag>;
  }

  const columns = [
    {
      title: 'Company Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Button type="link" onClick={() => {
          setSelectedCompany(record);
          setDetailsVisible(true);
        }}>
          {text}
        </Button>
      )
    },
    {
      title: 'Registration Number',
      dataIndex: 'registrationNumber',
      key: 'registrationNumber'
    },
    {
      title: 'Status',
      dataIndex: 'verifiedStatus',
      key: 'verifiedStatus',
      render: getStatusTag
    },
    {
      title: 'Submitted',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      render: (date) => date ? new Date(date).toLocaleDateString() : '-'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            size="small"
            disabled={record.verifiedStatus === 1}
            onClick={() => approveCompany(record._id)}
          >
            Approve
          </Button>
          <Button
            danger
            icon={<CloseOutlined />}
            size="small"
            disabled={record.verifiedStatus === 2}
            onClick={() => rejectCompany(record._id)}
          >
            Reject
          </Button>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => {
              setSelectedCompany(record);
              setDetailsVisible(true);
            }}
          >
            View
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div>
      <Title level={2}>Company Management</Title>

      <Card style={{ marginBottom: 16 }}>
        <Space style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Segmented
            options={[
              { label: 'All', value: 'all' },
              { label: 'Pending', value: 'pending' },
              { label: 'Approved', value: 'approved' },
              { label: 'Rejected', value: 'rejected' }
            ]}
            value={statusFilter}
            onChange={setStatusFilter}
          />
          <Button onClick={loadCompanies}>Refresh</Button>
        </Space>
      </Card>

      <Card>
        <AdminCompaniesTable
          companies={companies}
          loading={loading}
          onApprove={approveCompany}
          onReject={rejectCompany}
          onView={(rec) => { setSelectedCompany(rec); setDetailsVisible(true); }}
        />
      </Card>

      <Modal
        title="Company Details"
        open={detailsVisible}
        onCancel={() => setDetailsVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailsVisible(false)}>
            Close
          </Button>
        ]}
        width={800}
      >
        {selectedCompany && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Company Name">
              {selectedCompany.name}
            </Descriptions.Item>
            <Descriptions.Item label="Registration Number">
              {selectedCompany.registrationNumber}
            </Descriptions.Item>
            <Descriptions.Item label="Phone">
              {selectedCompany.phone}
            </Descriptions.Item>
            <Descriptions.Item label="Industry">
              {selectedCompany.industry || 'Not specified'}
            </Descriptions.Item>
            <Descriptions.Item label="Website">
              {selectedCompany.website || 'Not specified'}
            </Descriptions.Item>
            <Descriptions.Item label="Description">
              {selectedCompany.description || 'Not specified'}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {getStatusTag(selectedCompany.verifiedStatus)}
            </Descriptions.Item>
            <Descriptions.Item label="Submitted At">
              {selectedCompany.submittedAt ? new Date(selectedCompany.submittedAt).toLocaleString() : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Reviewed At">
              {selectedCompany.reviewedAt ? new Date(selectedCompany.reviewedAt).toLocaleString() : '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}
