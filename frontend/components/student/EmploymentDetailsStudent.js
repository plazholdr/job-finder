"use client";

import { useEffect, useState, useCallback } from 'react';
import { Descriptions, Divider, Space, Button, Typography, message, Modal, Form, Input, Select, Tag, Upload, Popconfirm, Alert } from 'antd';
import { API_BASE_URL } from '../../config';

const { Title, Text } = Typography;

export default function EmploymentDetailsStudent({ record, onUpdated }){
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [ecOpen, setEcOpen] = useState(false);
  const [ecForm] = Form.useForm();
  const [termOpen, setTermOpen] = useState(false);
  const [termForm] = Form.useForm();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('jf_token');
      const r = await fetch(`${API_BASE_URL}/employment-detail/${record._id || record.id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!r.ok) throw new Error('Failed to load employment detail');
      const j = await r.json();
      setDetail(j);
    } catch (e) { message.error(e.message || 'Failed to load detail'); }
    finally { setLoading(false); }
  }, [record?._id, record?.id]);

  useEffect(() => { load(); }, [load]);

  async function viewFile(key){
    try {
      if (!key) return;
      const token = localStorage.getItem('jf_token');
      const r = await fetch(`${API_BASE_URL}/upload/${encodeURIComponent(key)}`, { headers: { Authorization: `Bearer ${token}` } });
      const j = await r.json();
      const url = j.signedUrl || j.publicUrl;
      if (url) window.open(url, '_blank'); else message.error('Failed to resolve file');
    } catch (e) { message.error(e.message || 'Failed to open file'); }
  }

  async function uploadAndAttach(type){
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '*/*';
      input.onchange = async () => {
        const file = input.files?.[0]; if (!file) return resolve(false);
        try {
          const token = localStorage.getItem('jf_token');
          const fd = new FormData(); fd.append('document', file);
          const up = await fetch(`${API_BASE_URL}/upload`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
          if (!up.ok) throw new Error('Upload failed');
          const j = await up.json();
          const key = j?.files?.document?.[0]?.key;
          if (!key) throw new Error('No file key');
          await fetch(`${API_BASE_URL}/employment-records/${record._id || record.id}`, { method: 'PATCH', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ action: 'attachDoc', type, fileKey: key }) });
          message.success('File uploaded');
          await load(); onUpdated?.();
          resolve(true);
        } catch (e) { message.error(e.message || 'Failed to upload'); resolve(false); }
      };
      input.click();
    });
  }

  async function submitEarlyCompletion(){
    try {
      const v = await ecForm.validateFields();
      const token = localStorage.getItem('jf_token');
      await fetch(`${API_BASE_URL}/early-completions`, { method: 'POST', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ employmentId: record._id || record.id, reason: v.remark || 'Request to complete internship early' }) });
      message.success('Early completion request submitted');
      setEcOpen(false); ecForm.resetFields();
      await load(); onUpdated?.();
    } catch (e) { if (e?.errorFields) return; message.error(e.message || 'Failed to submit'); }
  }

  async function submitTermination(){
    try {
      const v = await termForm.validateFields();
      const token = localStorage.getItem('jf_token');
      await fetch(`${API_BASE_URL}/internship-terminations`, { method: 'POST', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ employmentId: record._id || record.id, reason: v.reason, remark: v.remark || undefined }) });
      message.success('Termination request submitted');
      setTermOpen(false); termForm.resetFields();
      await load(); onUpdated?.();
    } catch (e) { if (e?.errorFields) return; message.error(e.message || 'Failed to submit'); }
  }

  async function cancelEC(){
    try {
      const id = detail?.latestRequests?.earlyCompletion?._id; if (!id) return;
      const token = localStorage.getItem('jf_token');
      await fetch(`${API_BASE_URL}/early-completions/${id}`, { method: 'PATCH', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ action: 'cancel' }) });
      message.success('Request cancelled'); await load(); onUpdated?.();
    } catch (e) { message.error(e.message || 'Failed to cancel'); }
  }

  async function cancelTermination(){
    try {
      const id = detail?.latestRequests?.resignation?._id || detail?.termination?._id; // prefer pending resignation/termination
      if (!id) return;
      const token = localStorage.getItem('jf_token');
      await fetch(`${API_BASE_URL}/internship-terminations/${id}`, { method: 'PATCH', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ action: 'cancel' }) });
      message.success('Request cancelled'); await load(); onUpdated?.();
    } catch (e) { message.error(e.message || 'Failed to cancel'); }
  }

  const emp = detail?.employment;
  const job = detail?.job;
  const app = detail?.application;
  const docs = detail?.onboarding?.docs || [];

  const pendingEC = detail?.latestRequests?.earlyCompletion && detail.latestRequests.earlyCompletion.status === 0;
  const pendingResign = detail?.latestRequests?.resignation && detail.latestRequests.resignation.status === 0;

  const hasType = (t) => docs.some(d => d.type === t);

  return (
    <div>
      <Space direction="vertical" size="large" style={{ width:'100%' }}>
        <div>
          <Title level={4} style={{ marginBottom: 8 }}>Job details</Title>
          <Descriptions bordered size="small" column={1} loading={loading}>
            <Descriptions.Item label="Company">{job?.company?.name || job?.companyName || '-'}</Descriptions.Item>
            <Descriptions.Item label="Job title">{job?.title || '-'}</Descriptions.Item>
            <Descriptions.Item label="Start date">{emp?.startDate ? new Date(emp.startDate).toLocaleDateString() : '-'}</Descriptions.Item>
            <Descriptions.Item label="End date">{emp?.endDate ? new Date(emp.endDate).toLocaleDateString() : '-'}</Descriptions.Item>
            <Descriptions.Item label="Status">{typeof emp?.status === 'number' ? <Tag>{['Upcoming','Ongoing','Closure','Completed','Terminated'][emp.status] || emp.status}</Tag> : '-'}</Descriptions.Item>
          </Descriptions>
        </div>

        <div>
          <Title level={4} style={{ marginBottom: 8 }}>Application details</Title>
          <Descriptions bordered size="small" column={1}>
            <Descriptions.Item label="Application status">{typeof app?.status === 'number' ? <Tag>{['Applied','Shortlisted','Interview','Active offer','Hired','Rejected','Withdrawn','Not Attending'][app.status] || app.status}</Tag> : '-'}</Descriptions.Item>
            <Descriptions.Item label="Offer title">{app?.offer?.title || '-'}</Descriptions.Item>
            <Descriptions.Item label="Offer valid until">{app?.offer?.validUntil ? new Date(app.offer.validUntil).toLocaleDateString() : '-'}</Descriptions.Item>
            <Descriptions.Item label="Letter of offer">{app?.offer?.letterKey ? <Button size="small" onClick={()=>viewFile(app.offer.letterKey)}>View</Button> : '-'}</Descriptions.Item>
          </Descriptions>
        </div>

        <div>
          <Title level={4} style={{ marginBottom: 8 }}>Job onboarding materials</Title>
          {(job?.onboardingMaterials || []).length ? (
            <Space direction="vertical" style={{ width:'100%' }}>
              {(job.onboardingMaterials || []).map((m, idx) => (
                <div key={idx} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <Text>{m.title || m.type || `Material ${idx+1}`}</Text>
                  {m.fileKey && <Button size="small" onClick={()=>viewFile(m.fileKey)}>View</Button>}
                </div>
              ))}
            </Space>
          ) : <Text type="secondary">No materials</Text>}
        </div>

        {/* Requests panel (pending + cancel) */}
        {(pendingEC || pendingResign) && (
          <Alert type="info" showIcon message="Your request is in progress" description={
            <Space direction="vertical" size={8}>
              {pendingEC && (
                <div>
                  Early completion request pending
                  <div>
                    <Popconfirm title="Cancel this request?" onConfirm={cancelEC}>
                      <Button size="small" danger type="link">Cancel request</Button>
                    </Popconfirm>
                  </div>
                </div>
              )}
              {pendingResign && (
                <div>
                  Termination request pending
                  <div>
                    <Popconfirm title="Cancel this request?" onConfirm={cancelTermination}>
                      <Button size="small" danger type="link">Cancel request</Button>
                    </Popconfirm>
                  </div>
                </div>
              )}
            </Space>
          } />
        )}

        <Divider style={{ margin: '8px 0' }} />

        {/* Actions for ongoing employment */}
        {emp?.status === 1 && (
          <Space wrap>
            <Button type="primary" onClick={()=>setEcOpen(true)} disabled={pendingEC} title={pendingEC ? 'Early completion request pending' : undefined}>
              Request early completion
            </Button>
            <Button danger onClick={()=>setTermOpen(true)} disabled={pendingResign} title={pendingResign ? 'Termination/resignation request pending' : undefined}>
              Request termination
            </Button>
          </Space>
        )}

        {/* Closure state: allow uploads for final report and reviews */}
        {emp?.status === 2 && (
          <div>
            <Title level={4} style={{ marginBottom: 8 }}>Provide internship closure documents</Title>
            <Space direction="vertical" style={{ width:'100%' }}>
              <Space>
                <Text>Internship final report</Text>
                <Button size="small" onClick={()=>uploadAndAttach('finalReport')}>{hasType('finalReport') ? 'Re-upload' : 'Upload'}</Button>
              </Space>
              <Space>
                <Text>Internship job review</Text>
                <Button size="small" onClick={()=>uploadAndAttach('jobReview')}>{hasType('jobReview') ? 'Re-upload' : 'Upload'}</Button>
              </Space>
              <Space>
                <Text>Internship company review</Text>
                <Button size="small" onClick={()=>uploadAndAttach('companyReview')}>{hasType('companyReview') ? 'Re-upload' : 'Upload'}</Button>
              </Space>
              <Text type="secondary">Company will verify your submissions before marking employment as completed.</Text>
            </Space>
          </div>
        )}

        {/* Completed: show submitted docs */}
        {emp?.status === 3 && (
          <div>
            <Title level={4} style={{ marginBottom: 8 }}>Internship review</Title>
            <Space direction="vertical">
              {['finalReport','jobReview','companyReview'].map((t) => {
                const d = docs.find(x => x.type === t);
                return (
                  <div key={t}>
                    <Text strong>{t}</Text>: {d ? <Button size="small" onClick={()=>viewFile(d.fileKey)}>View</Button> : <Text type="secondary">Not provided</Text>}
                  </div>
                );
              })}
            </Space>
          </div>
        )}

        {/* Terminated: show termination details */}
        {emp?.status === 4 && detail?.termination && (
          <div>
            <Title level={4}>Termination details</Title>
            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label="Terminated by">{detail.termination.initiatedBy || '-'}</Descriptions.Item>
              <Descriptions.Item label="Termination reason">{detail.termination.reason || '-'}</Descriptions.Item>
              <Descriptions.Item label="Termination remark">{detail.termination.remark || '-'}</Descriptions.Item>
              <Descriptions.Item label="Decided at">{detail.termination.decidedAt ? new Date(detail.termination.decidedAt).toLocaleString() : '-'}</Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Space>

      <Modal title="Request early completion" open={ecOpen} onCancel={()=>{ setEcOpen(false); ecForm.resetFields(); }} onOk={submitEarlyCompletion} okText="Submit">
        <Form form={ecForm} layout="vertical">
          <Form.Item label="Completion remark" name="remark" rules={[{ required: true, message: 'Please enter your remark' }]}>
            <Input.TextArea rows={3} placeholder="Why do you want to complete early?" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="Request termination" open={termOpen} onCancel={()=>{ setTermOpen(false); termForm.resetFields(); }} onOk={submitTermination} okText="Submit" okButtonProps={{ danger: true }}>
        <Form form={termForm} layout="vertical">
          <Form.Item label="Termination reason" name="reason" rules={[{ required: true, message: 'Please select a reason' }]}>
            <Select placeholder="Choose a reason">
              <Select.Option value="Personal reasons">Personal reasons</Select.Option>
              <Select.Option value="Unsuitable role fit">Unsuitable role fit</Select.Option>
              <Select.Option value="Health or family matters">Health or family matters</Select.Option>
              <Select.Option value="Relocation/commute issues">Relocation/commute issues</Select.Option>
              <Select.Option value="Other">Other</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="Remark (optional)" name="remark">
            <Input.TextArea rows={3} placeholder="Additional context (optional)" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

