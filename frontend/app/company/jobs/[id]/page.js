"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Layout, Typography, Card, Space, Tag, Descriptions, message, Button, Modal, Form, Input } from 'antd';
import Navbar from '../../../../components/Navbar';
import Footer from '../../../../components/Footer';
import { API_BASE_URL } from '../../../../config';

const { Title, Paragraph, Text } = Typography;

export default function CompanyJobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const search = useSearchParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [picModalOpen, setPicModalOpen] = useState(false);
  const [picForm] = Form.useForm();

  useEffect(() => { (async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('jf_token');
      if (!token) { message.info('Please sign in'); router.replace('/login'); return; }
      const res = await fetch(`${API_BASE_URL}/job-listings/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to load job');
      const data = await res.json();
      setJob(data);
      // Auto-open PIC modal when requested via URL
      const ep = search?.get('editPIC');
      if (ep && String(ep) !== '0' && data.status === 1) {
        picForm.setFieldsValue({ name: data.pic?.name || data.picName, phone: data.pic?.phone || data.picContact, email: data.pic?.email });
        setPicModalOpen(true);
      }
    } catch (e) {
      message.error(e.message || 'Failed to load');
    } finally { setLoading(false); }
  })(); }, [id, router, search, picForm]);

  const statusLabel = (s) => s===0?'Draft':s===1?'Pending':s===2?'Active':s===3?'Past':'-';

  return (
    <Layout>
      <Navbar />
      <Layout.Content style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
        <Card loading={loading}>
          {!job ? (
            <Title level={4}>Job not found</Title>
          ) : (
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <Title level={3} style={{ margin: 0 }}>
                    {job.title}
                    {job.status === 3 && <Tag color="red" style={{ marginLeft: 8 }}>Past</Tag>}
                    {job.status === 1 && job.picUpdatedAt && <Tag color="blue" style={{ marginLeft: 8 }}>PIC updated</Tag>}
                  </Title>
                  <Text type="secondary">{job.company?.name || job.companyName || '-'}</Text>
                  {job.status === 1 && job.picUpdatedAt && (
                    <div><Text type="secondary">PIC updated {new Date(job.picUpdatedAt).toLocaleString()}</Text></div>
                  )}
                </div>
                <Space>
                  {job.status === 0 && (
                    <Button type="primary" onClick={() => router.push(`/company/jobs/${job._id}/edit`)}>Continue editing</Button>
                  )}
                  {job.status === 1 && (
                    <Button onClick={() => { picForm.setFieldsValue({ name: job.pic?.name || job.picName, phone: job.pic?.phone || job.picContact, email: job.pic?.email }); setPicModalOpen(true); }}>Edit PIC</Button>
                  )}
                  {job.status === 2 && (
                    <Button danger onClick={() => {
                      Modal.confirm({
                        title: 'Close this job?',
                        content: 'Once closed, it will be removed from public listings and candidates with the link will see Job unavailable.',
                        okText: 'Yes, close job',
                        cancelText: 'Cancel',
                        onOk: async () => {
                          try {
                            const token = localStorage.getItem('jf_token');
                            const res = await fetch(`${API_BASE_URL}/job-listings/${job._id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ close: true }) });
                            if (!res.ok) throw new Error('Failed to close job');
                            message.success('Job closed');
                            router.replace('/company/profile?tab=past');
                          } catch (e) { message.error(e.message || 'Failed to close'); }
                        }
                      });
                    }}>Close job</Button>
                  )}
                  <Button onClick={() => router.push('/company/profile')}>Back to listings</Button>
                </Space>
              </div>

              <Descriptions bordered column={1} size="middle">
                <Descriptions.Item label="Status">{statusLabel(job.status)}</Descriptions.Item>
                <Descriptions.Item label="Location">{job.location?.city || job.location?.state ? `${job.location?.city || ''}${job.location?.city && job.location?.state ? ', ' : ''}${job.location?.state || ''}` : (job.locations || []).join(', ') || '-'}</Descriptions.Item>
                <Descriptions.Item label="Salary Range">{job.salaryRange && (job.salaryRange.min || job.salaryRange.max) ? `RM ${job.salaryRange.min ?? 0}${job.salaryRange.max ? ' - RM ' + job.salaryRange.max : ''}` : '-'}</Descriptions.Item>
                <Descriptions.Item label="Quantity">{job.quantityAvailable ?? job.quantity ?? '-'}</Descriptions.Item>
                <Descriptions.Item label="PIC">{job.pic?.name ? `${job.pic.name} (${job.pic.phone || job.pic.email || ''})` : '-'}</Descriptions.Item>
                <Descriptions.Item label="Publish At">{job.publishAt ? new Date(job.publishAt).toLocaleString() : '-'}</Descriptions.Item>
                <Descriptions.Item label="Expires At">{job.expiresAt ? new Date(job.expiresAt).toLocaleString() : '-'}</Descriptions.Item>
              </Descriptions>

              <div>
                <Title level={4} style={{ marginBottom: 8 }}>Job Description</Title>
                <Paragraph>{job.description || '-'}</Paragraph>
              </div>

              <div>
                <Title level={4} style={{ marginBottom: 8 }}>Project Details</Title>
                {job.project ? (
                  <Descriptions bordered column={1} size="middle">
                    <Descriptions.Item label="Title">{job.project.title || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Description">{job.project.description || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Duration">{job.project.startDate || job.project.start ? new Date(job.project.startDate || job.project.start).toLocaleDateString() : '-'}
                      {job.project.endDate || job.project.end ? ` - ${new Date(job.project.endDate || job.project.end).toLocaleDateString()}` : ''}
                    </Descriptions.Item>
                    <Descriptions.Item label="Locations">{Array.isArray(job.project.locations) && job.project.locations.length ? job.project.locations.join(', ') : '-'}</Descriptions.Item>
                    <Descriptions.Item label="Role Description">{job.project.roleDescription || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Areas of Interest">{Array.isArray(job.project.areasOfInterest || job.project.interests) && (job.project.areasOfInterest || job.project.interests).length ? (job.project.areasOfInterest || job.project.interests).join(', ') : '-'}</Descriptions.Item>
                  </Descriptions>
                ) : (
                  <Paragraph type="secondary">No project details</Paragraph>
                )}
              </div>

              <div>
                <Title level={4} style={{ marginBottom: 8 }}>Onboarding Materials</Title>
                {Array.isArray(job?.onboarding?.generalDocs) || Array.isArray(job?.onboarding?.jobSpecificDocs) ? (
                  <Space direction="vertical">
                    {Array.isArray(job.onboarding.generalDocs) && job.onboarding.generalDocs.length > 0 && (
                      <div>
                        <Text strong>General</Text>
                        <div style={{ marginTop: 6 }}>
                          {job.onboarding.generalDocs.map((d,i)=>(<div key={i}><a href={d.url} target="_blank" rel="noreferrer">{d.name || d.key || `File ${i+1}`}</a></div>))}
                        </div>
                      </div>
                    )}
                    {Array.isArray(job.onboarding.jobSpecificDocs) && job.onboarding.jobSpecificDocs.length > 0 && (
                      <div>
                        <Text strong>Job-specific</Text>
                        <div style={{ marginTop: 6 }}>
                          {job.onboarding.jobSpecificDocs.map((d,i)=>(<div key={i}><a href={d.url} target="_blank" rel="noreferrer">{d.name || d.key || `File ${i+1}`}</a></div>))}
                        </div>
                      </div>
                    )}
                  </Space>
                ) : Array.isArray(job.onboardingMaterials) && job.onboardingMaterials.length ? (
                  <div>
                    {job.onboardingMaterials.map((d,i)=>(<div key={i}><a href={d.url} target="_blank" rel="noreferrer">{d.label || d.name || d.key || `File ${i+1}`}</a></div>))}
                  </div>
                ) : (
                  <Paragraph type="secondary">No onboarding materials</Paragraph>
                )}
              </div>

              <Modal
                title="Edit PIC"
                open={picModalOpen}
                onCancel={()=>setPicModalOpen(false)}
                onOk={async ()=>{
                  try {
                    const token = localStorage.getItem('jf_token');
                    const vals = await picForm.validateFields();
                    const res = await fetch(`${API_BASE_URL}/job-listings/${job._id}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                      body: JSON.stringify({ pic: { name: vals.name, phone: vals.phone, email: vals.email } })
                    });
                    if (!res.ok) throw new Error('Failed to update PIC');
                    message.success('PIC updated');
                    setPicModalOpen(false);
                    const fresh = await fetch(`${API_BASE_URL}/job-listings/${job._id}`, { headers: { Authorization: `Bearer ${token}` } });
                    setJob(await fresh.json());
                  } catch (e) { message.error(e.message || 'Failed to update'); }
                }}
              >
                <Form layout="vertical" form={picForm}>
                  <Form.Item name="name" label="PIC name" rules={[{ required: true }]}><Input /></Form.Item>
                  <Form.Item name="phone" label="PIC phone" rules={[{ required: true }]}><Input /></Form.Item>
                  <Form.Item name="email" label="PIC email" rules={[{ type:'email', required: false }]}><Input /></Form.Item>
                </Form>
              </Modal>
            </Space>
          )}
        </Card>
      </Layout.Content>
      <Footer />
    </Layout>
  );
}

