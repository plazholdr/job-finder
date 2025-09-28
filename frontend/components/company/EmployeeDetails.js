"use client";

import { useEffect, useState } from 'react';
import { Descriptions, Space, Tag, List, Button, App, Modal } from 'antd';
import { API_BASE_URL } from '../../config';

const statusText = (s) => ({0:'Upcoming',1:'Ongoing',2:'Closure',3:'Completed',4:'Terminated'}[s] || String(s));

export default function EmployeeDetails({ record }) {
  const [user, setUser] = useState(null);
  const [job, setJob] = useState(null);
  const { message } = App.useApp();

  useEffect(() => { (async () => {
    try {
      const token = localStorage.getItem('jf_token');
      const headers = { Authorization: `Bearer ${token}` };
      if (record?.userId) {
        const ur = await fetch(`${API_BASE_URL}/users/${record.userId}`, { headers });
        if (ur.ok) setUser(await ur.json());
      }
      if (record?.jobListingId) {
        const jr = await fetch(`${API_BASE_URL}/job-listings/${record.jobListingId}`, { headers });
        if (jr.ok) setJob(await jr.json());
      }
    } catch (_) {}
  })(); }, [record?._id]);

  async function patchEmployment(action, extra = {}) {
    try {
      const token = localStorage.getItem('jf_token');
      const res = await fetch(`${API_BASE_URL}/employment-records/${record._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action, ...extra })
      });
      if (!res.ok) throw new Error(`Action failed (${res.status})`);
      message.success('Updated');
      if (typeof window !== 'undefined') window.location.reload();
    } catch (e) {
      message.error(e.message || 'Failed');
    }
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Descriptions bordered column={1} size="small">
        <Descriptions.Item label="Candidate">{user?.profile ? `${user.profile.firstName || ''} ${user.profile.lastName || ''}`.trim() || user?.email : (record?.userId || '-')}</Descriptions.Item>
        <Descriptions.Item label="Job">{job?.title || (record?.jobListingId || '-')}</Descriptions.Item>
        <Descriptions.Item label="Status">{statusText(record?.status)} {record?.status === 3 ? <Tag color="green">Completed</Tag> : null}</Descriptions.Item>
        <Descriptions.Item label="Start Date">{record?.startDate ? new Date(record.startDate).toLocaleString() : '-'}</Descriptions.Item>
        <Descriptions.Item label="End Date">{record?.endDate ? new Date(record.endDate).toLocaleString() : '-'}</Descriptions.Item>
      </Descriptions>

      <Space>
        {record?.status === 0 && (
          <Button type="primary" onClick={() => patchEmployment('startNow')}>Start now</Button>
        )}
        {record?.status === 1 && (
          <Button onClick={() => patchEmployment('moveToClosure')}>Move to closure</Button>
        )}
        {[0,1,2].includes(record?.status) && (
          <Button danger onClick={() => {
            Modal.confirm({ title: 'Terminate employment?', okText: 'Terminate', okButtonProps: { danger: true }, onOk: () => patchEmployment('terminate') });
          }}>Terminate</Button>
        )}
      </Space>

      {Array.isArray(record?.requiredDocs) && (
        <Descriptions title="Required Documents" bordered column={1} size="small">
          <Descriptions.Item label="Types">{record.requiredDocs.join(', ') || '-'}</Descriptions.Item>
        </Descriptions>
      )}

      {Array.isArray(record?.docs) && record.docs.length > 0 && (
        <div>
          <h4 style={{ marginBottom: 8 }}>Uploaded Docs</h4>
          <List
            size="small"
            dataSource={record.docs}
            renderItem={(d) => (
              <List.Item>
                <Space>
                  <Tag>{d.type}</Tag>
                  <span>{d.fileKey}</span>
                  <Tag color={d.verified ? 'green' : 'orange'}>{d.verified ? 'Verified' : 'Pending'}</Tag>
                </Space>
              </List.Item>
            )}
          />
        </div>
      )}
    </Space>
  );
}

