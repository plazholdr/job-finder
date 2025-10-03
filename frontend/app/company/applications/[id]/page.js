"use client";
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Layout, Typography, Space, Card, Descriptions, Tag, Button, Modal, Form, Input, DatePicker, Upload, message } from 'antd';
import Navbar from '../../../../components/Navbar';
import Footer from '../../../../components/Footer';
import { API_BASE_URL } from '../../../../config';
import { UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

function SectionKV({ data }){
  if (!data || typeof data !== 'object') return <span>-</span>;
  const entries = Object.entries(data || {});
  if (!entries.length) return <span>-</span>;
  return (
    <div style={{ display:'grid', gridTemplateColumns:'200px 1fr', gap:8 }}>
      {entries.map(([k,v]) => (
        <>
          <div style={{ fontWeight:600, color:'#555' }}>{k.replace(/([A-Z])/g,' $1').replace(/^./,s=>s.toUpperCase())}</div>
          <div style={{ whiteSpace:'pre-wrap' }}>{typeof v === 'object' ? JSON.stringify(v) : String(v)}</div>
        </>
      ))}
    </div>
  );
}

export default function ApplicationDetailPage({ params }) {
  const { id } = params || {};
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [offerOpen, setOfferOpen] = useState(false);
  const [rejectOfferedOpen, setRejectOfferedOpen] = useState(false);
  const [rejectForm] = Form.useForm();
  const [offerForm] = Form.useForm();
  const [uploadMeta, setUploadMeta] = useState(null);
  const [letterUrl, setLetterUrl] = useState(null);

  const statusTag = (s) => {
    const map = { 0:['New','blue'],1:['Shortlisted','cyan'],2:['Interview','purple'],3:['Pending Acceptance','gold'],4:['Hired','green'],5:['Rejected','red'],6:['Withdrawn','default'],7:['Not Attending','default'] };
    const m = map[s];
    return m ? <Tag color={m[1]}>{m[0]}</Tag> : <Tag>{String(s)}</Tag>;
  };

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('jf_token');
      if (!token) { message.error('Please sign in'); window.location.href = '/login'; return; }
      const res = await fetch(`${API_BASE_URL}/applications/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to load application');
      const json = await res.json();
      setData(json);
    } catch (e) { message.error(e.message || 'Failed to load'); } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // Resolve offer letter signed URL when needed
  useEffect(() => {
    (async () => {
      try {
        if (!data?.offer || letterUrl) return;
        if (data.offer.letterUrl) { setLetterUrl(data.offer.letterUrl); return; }
        if (data.offer.letterKey) {
          const jwt = localStorage.getItem('jf_token');
          const r = await fetch(`${API_BASE_URL}/upload/${encodeURIComponent(data.offer.letterKey)}`, { headers: { Authorization: `Bearer ${jwt}` } });
          if (r.ok) { const j = await r.json(); setLetterUrl(j?.signedUrl || j?.publicUrl || null); }
        }
      } catch (_) {}
    })();
  }, [data, letterUrl]);

  const canShortlist = data && data.status === 0; // NEW
  const canRejectShortlisted = data && data.status === 1; // only when Shortlisted
  const canSendOffer = data && data.status === 1; // only when Shortlisted
  const isPendingAcceptance = data && data.status === 3;

  async function patchAction(body) {
    const token = localStorage.getItem('jf_token');
    const res = await fetch(`${API_BASE_URL}/applications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`Action failed (${res.status})`);
    return res.json();
  }

  async function shortlist() {
    try {
      await patchAction({ action: 'shortlist' });
      message.success('Shortlisted');
      load();
    } catch (e) { message.error(e.message); }
  }

  async function submitReject() {
    try {
      const v = await rejectForm.validateFields();
      await new Promise((resolve, reject) => {
        Modal.confirm({
          title: 'Confirm rejection',
          content: 'Are you sure you want to reject this shortlisted application?',
          okText: 'Reject', okButtonProps: { danger: true },
          onOk: resolve, onCancel: () => reject(new Error('cancel'))
        });
      });
      await patchAction({ action: 'reject', reason: v.reason });
      message.success('Application rejected');
      setRejectOpen(false); rejectForm.resetFields(); load();
    } catch (e) { if (e?.errorFields || e.message === 'cancel') return; message.error(e.message); }
  }

  async function handleUpload(file) {
    try {
      const token = localStorage.getItem('jf_token');
      const fd = new FormData();
      fd.append('document', file);
      const up = await fetch(`${API_BASE_URL}/upload`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
      if (!up.ok) throw new Error('Upload failed');
      const data = await up.json();
      const f = data?.files?.document?.[0];
      const meta = { url: f?.url || f?.signedUrl, key: f?.key, name: file.name };
      setUploadMeta(meta);
    } catch (e) { message.error(e.message || 'Upload failed'); }
    return false;
  }

  async function submitOffer() {
    try {
      const v = await offerForm.validateFields();
      if (!uploadMeta?.key) {
        message.error('Please upload the offer letter');
        return;
      }
      await new Promise((resolve, reject) => {
        Modal.confirm({
          title: 'Send offer?',
          content: 'Confirm sending the offer to the candidate.',
          onOk: resolve,
          onCancel: () => reject(new Error('cancel'))
        });
      });
      await patchAction({
        action: 'sendOffer',
        title: v.title,
        notes: v.notes || '',
        validUntil: v.validUntil?.toDate?.() || v.validUntil,
        letterKey: uploadMeta.key
      });
      message.success('Offer sent');
      setOfferOpen(false);
      offerForm.resetFields();
      setUploadMeta(null);
      load();
    } catch (e) {
      // If validation error, Ant Design will show the error in the form
      if (e?.errorFields) {
        message.error('Please fill in all required fields');
        return;
      }
      // If user cancelled the confirmation
      if (e.message === 'cancel') return;
      // Other errors
      message.error(e.message || 'Failed to send offer');
    }
  }

  return (
    <Layout>
      <Navbar />
      <Layout.Content style={{ padding: 24, minHeight: '80vh' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <Title level={3} style={{ margin: 0 }}>Application Details</Title>
              <Space>
                {canShortlist && <Button onClick={shortlist}>Shortlist</Button>}
                {canRejectShortlisted && <Button danger onClick={() => setRejectOpen(true)}>Reject</Button>}
                {canSendOffer && <Button type="primary" onClick={() => setOfferOpen(true)}>Send Offer</Button>}
                {isPendingAcceptance && <Button danger onClick={() => setRejectOfferedOpen(true)}>Reject Offered Position</Button>}
                <Button onClick={load}>Refresh</Button>
              </Space>
            </div>

            <Card loading={loading}>
              {data && (
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                  <Descriptions title="Status" bordered column={2} size="small">
                    <Descriptions.Item label="Current">{statusTag(data.status)}</Descriptions.Item>
                    <Descriptions.Item label="Submitted">{data.createdAt ? new Date(data.createdAt).toLocaleString() : '-'}</Descriptions.Item>
                    <Descriptions.Item label="Application Validity">{data.validityUntil ? new Date(data.validityUntil).toLocaleDateString() : '-'}</Descriptions.Item>
                    {data.offer?.validUntil && <Descriptions.Item label="Offer Valid Until">{new Date(data.offer.validUntil).toLocaleDateString()}</Descriptions.Item>}
                  </Descriptions>

                  <Descriptions title="Job Details" bordered column={1} size="small">
                    <Descriptions.Item label="Title">{data.job?.title || data.jobTitle || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Company PIC">{data.job?.picName || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Location">{data.job?.location || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Salary Range">{data.job?.salaryRange || '-'}</Descriptions.Item>
                  </Descriptions>

                  {(isPendingAcceptance || (data && data.status === 4)) && (
                    <Descriptions title="Offer Details" bordered column={1} size="small">
                      <Descriptions.Item label="Title">{data.offer?.title || '-'}</Descriptions.Item>
                      <Descriptions.Item label="Notes">{data.offer?.notes || '-'}</Descriptions.Item>
                      <Descriptions.Item label="Offer Validity">{data.offer?.validUntil ? new Date(data.offer.validUntil).toLocaleDateString() : '-'}</Descriptions.Item>
                      <Descriptions.Item label="Letter of Offer">
                        {letterUrl ? (
                          <a href={letterUrl} target="_blank" rel="noreferrer">View Letter</a>
                        ) : data.offer?.letterKey ? (
                          <span>{data.offer.letterKey}</span>
                        ) : '-'}
                      </Descriptions.Item>
                    </Descriptions>
                  )}

                  {data && data.status === 4 && (
                    <Space>
                      <Button type="link" onClick={()=>{ window.location.href = '/company/employees'; }}>Open Employee Management</Button>
                    </Space>
                  )}

                  {data && data.status === 5 && (
                    <Descriptions title="Rejection Details" bordered column={1} size="small">
                      <Descriptions.Item label="Rejected At">{data.rejectedAt ? new Date(data.rejectedAt).toLocaleString() : '-'}</Descriptions.Item>
                      <Descriptions.Item label="Rejected By">{data.rejection?.by || '-'}</Descriptions.Item>
                      <Descriptions.Item label="Reason">{data.rejection?.reason || '-'}</Descriptions.Item>
                    </Descriptions>
                  )}

                  <Descriptions title="Intern Application Information" bordered column={1} size="small">
                    <Descriptions.Item label="Candidate">{data.candidate?.fullName || data.candidateName || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Candidate Statement">{data.candidateStatement || data.statement || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Application Validity">{data.validityUntil ? new Date(data.validityUntil).toLocaleDateString() : '-'}</Descriptions.Item>
                    <Descriptions.Item label="Personal Information"><SectionKV data={data.form?.personalInfo || data.personalInfo} /></Descriptions.Item>
                    <Descriptions.Item label="Internship Details"><SectionKV data={data.form?.internshipInfo || data.internshipInfo} /></Descriptions.Item>
                    <Descriptions.Item label="Course Information"><SectionKV data={data.form?.courseInfo || data.courseInfo} /></Descriptions.Item>
                    <Descriptions.Item label="Assignment Information"><SectionKV data={data.form?.assignmentInfo || data.assignmentInfo} /></Descriptions.Item>
                    {data.applicationDetails && (
                      <Descriptions.Item label="Application Details"><SectionKV data={data.applicationDetails} /></Descriptions.Item>
                    )}
                  </Descriptions>

                  {Array.isArray(data?.statusHistory) && (
                    <Descriptions title="Status History" bordered column={1} size="small">
                      <Descriptions.Item label="Entries">
                        <div>
                          {data.statusHistory.map((h, i) => (
                            <div key={i} style={{ display:'flex', justifyContent:'space-between', borderBottom:'1px dashed #eee', padding:'4px 0' }}>
                              <span>{h.statusText || h.status || '-'}</span>
                              <span style={{ color:'#888' }}>{h.at ? new Date(h.at).toLocaleString() : '-'}</span>
                            </div>
                          ))}
                        </div>
                      </Descriptions.Item>
                    </Descriptions>
                  )}

                  {Array.isArray(data?.remarkHistory) && (
                    <Descriptions title="Application Remark History" bordered column={1} size="small">
                      <Descriptions.Item label="Remarks">
                        <div>
                          {data.remarkHistory.map((r, i) => (
                            <div key={i} style={{ marginBottom:8 }}>
                              <div style={{ fontWeight:600 }}>{r.author || 'Admin'}</div>
                              <div>{r.remark || r.text || '-'}</div>
                              <div style={{ color:'#888', fontSize:12 }}>{r.at ? new Date(r.at).toLocaleString() : '-'}</div>
                            </div>
                          ))}
                        </div>
                      </Descriptions.Item>
                    </Descriptions>
                  )}
                </Space>
              )}
            </Card>
          </Space>
        </div>
      </Layout.Content>
      <Footer />

      <Modal title="Reject Application" open={rejectOpen} onCancel={()=>setRejectOpen(false)} onOk={submitReject} okText="Reject" okButtonProps={{ danger: true }}>
        <Form form={rejectForm} layout="vertical">
          <Form.Item label="Reason" name="reason" rules={[{ required: true, message: 'Please provide a rejection reason' }]}>
            <Input.TextArea rows={4} placeholder="Explain why this application is rejected" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="Send Offer" open={offerOpen} onCancel={()=>setOfferOpen(false)} onOk={submitOffer} okText="Send Offer">
        <Form form={offerForm} layout="vertical" initialValues={{ validUntil: dayjs().add(7,'day') }}>
          <Form.Item label="Title" name="title" rules={[{ required: true, message: 'Title is required' }]}>
            <Input placeholder="Offer title" />
          </Form.Item>
          <Form.Item label="Notes" name="notes">
            <Input.TextArea rows={3} placeholder="Notes to the candidate (optional)" />
          </Form.Item>
          <Form.Item label="Valid Until" name="validUntil" rules={[{ required: true, message: 'Please set offer validity date' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Offer Letter (PDF/DOC)" required>
            <Upload beforeUpload={(f)=>handleUpload(f)} maxCount={1} accept=".pdf,.doc,.docx,.txt">
              <Button icon={<UploadOutlined />}>Upload Document</Button>
            </Upload>
            {uploadMeta?.name && <Text type="secondary">Uploaded: {uploadMeta.name}</Text>}
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="Reject Offered Position" open={rejectOfferedOpen} onCancel={()=>setRejectOfferedOpen(false)}
        onOk={async ()=>{
          try {
            await new Promise((resolve, reject) => {
              Modal.confirm({ title: 'Confirm rejection of offered position?', okText: 'Reject', okButtonProps:{ danger:true }, onOk: resolve, onCancel: () => reject(new Error('cancel')) });
            });
            await patchAction({ action: 'reject', reason: 'Rejected while pending acceptance' });
            message.success('Offered position rejected');
            setRejectOfferedOpen(false); load();
          } catch (e) { if (e.message !== 'cancel') message.error(e.message || 'Failed'); }
        }} okText="Reject" okButtonProps={{ danger: true }}>
        <Typography.Paragraph>
          This will reject the application currently pending candidate acceptance.
        </Typography.Paragraph>
      </Modal>
    </Layout>
  );
}

