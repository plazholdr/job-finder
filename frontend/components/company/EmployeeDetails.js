"use client";

import { useEffect, useMemo, useState } from 'react';
import { Descriptions, Space, Tag, List, Button, App, Modal, Form, Input, DatePicker, Divider, Typography, Popconfirm, Alert } from 'antd';
import { API_BASE_URL } from '../../config';

const { Paragraph } = Typography;
const statusText = (s) => ({0:'Upcoming',1:'Ongoing',2:'Closure',3:'Completed',4:'Terminated'}[s] || String(s));

export default function EmployeeDetails({ record }) {
  const { message } = App.useApp();
  const [detail, setDetail] = useState(null); // employment-detail payload
  const [offerUrl, setOfferUrl] = useState(null);
  const [termOpen, setTermOpen] = useState(false);
  const [termForm] = Form.useForm();
  const [closeOpen, setCloseOpen] = useState(false);
  const [closeForm] = Form.useForm();
  const [names, setNames] = useState({});
  const [rejectModal, setRejectModal] = useState({ open: false, kind: null, id: null });
  const [rejectForm] = Form.useForm();

  // Load composite detail (employment + job + application + history + onboarding)
  useEffect(() => { (async () => {
    try {
      if (!record?._id) return;
      const token = localStorage.getItem('jf_token');
      const headers = { Authorization: `Bearer ${token}` };
      const r = await fetch(`${API_BASE_URL}/employment-detail/${record._id}`, { headers });
      if (r.ok) {
        const data = await r.json();
        setDetail(data);
        // resolve offer letter if present
        const key = data?.application?.offer?.letterKey;
        if (key) {
          try {
            const ur = await fetch(`${API_BASE_URL}/upload/${encodeURIComponent(key)}`, { headers });
            if (ur.ok) {
              const j = await ur.json(); setOfferUrl(j.signedUrl || j.publicUrl || null);
            }
          } catch (_) {}
        }
        // resolve names (candidate + note authors)
        try {
          const ids = new Set();
          if (data?.employment?.userId) ids.add(String(data.employment.userId));
          (data?.notes || []).forEach(n => n?.byUserId && ids.add(String(n.byUserId)));
          const entries = await Promise.all(Array.from(ids).map(async (id) => {
            const ur = await fetch(`${API_BASE_URL}/users/${id}`, { headers });
            if (!ur.ok) return [id, id];
            const u = await ur.json();
            const name = u?.profile ? `${u.profile.firstName||''} ${u.profile.lastName||''}`.trim() : '';
            return [id, name || u?.email || id];
          }));
          const map = Object.fromEntries(entries);
          setNames(map);
        } catch (_) {}
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
    } catch (e) { message.error(e.message || 'Failed'); }
  }

  async function terminateEmployment() {
    try {
      const v = await termForm.validateFields();
      const token = localStorage.getItem('jf_token');
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
      // 1) create termination request (include remark)
      const createRes = await fetch(`${API_BASE_URL}/internship-terminations`, {
        method: 'POST', headers, body: JSON.stringify({ employmentId: record._id, reason: v.reason, remark: v.remark || undefined, proposedLastDay: v.lastDay || undefined })
      });
      if (!createRes.ok) throw new Error('Failed to create termination');
      const created = await createRes.json();
      // 2) approve immediately (company initiated)
      const approveRes = await fetch(`${API_BASE_URL}/internship-terminations/${created._id}`, {
        method: 'PATCH', headers, body: JSON.stringify({ action: 'approve' })
      });
      if (!approveRes.ok) throw new Error('Failed to approve termination');
      // 3) optional remark also saved as employment note for visibility
      if (v.remark) {
        await fetch(`${API_BASE_URL}/employment-records/${record._id}`, {
          method: 'PATCH', headers, body: JSON.stringify({ action: 'addNote', text: v.remark })
        }).catch(()=>{});
      }
      message.success('Employment terminated');
      setTermOpen(false); termForm.resetFields();
      if (typeof window !== 'undefined') window.location.reload();
    } catch (e) {
      if (e?.errorFields) return; message.error(e.message || 'Termination failed');
    }
  }

  async function decideEarlyCompletion(id, approve, remark){
    try {
      const token = localStorage.getItem('jf_token');
      const headers = { 'Content-Type':'application/json', Authorization: `Bearer ${token}` };
      const r = await fetch(`${API_BASE_URL}/early-completions/${id}`, { method: 'PATCH', headers, body: JSON.stringify({ action: approve ? 'approve' : 'reject', decisionRemark: !approve ? remark : undefined }) });
      if (!r.ok) throw new Error('Action failed');
      if (!approve && remark) {
        await fetch(`${API_BASE_URL}/employment-records/${record._id}`, { method: 'PATCH', headers, body: JSON.stringify({ action: 'addNote', text: `Early completion rejected: ${remark}` }) }).catch(()=>{});
      }
      message.success('Updated');
      if (typeof window !== 'undefined') window.location.reload();
    } catch (e) { message.error(e.message || 'Failed'); }
  }

  async function decideTermination(id, approve, remark){
    try {
      const token = localStorage.getItem('jf_token');
      const headers = { 'Content-Type':'application/json', Authorization: `Bearer ${token}` };
      const r = await fetch(`${API_BASE_URL}/internship-terminations/${id}`, { method: 'PATCH', headers, body: JSON.stringify({ action: approve ? 'approve' : 'reject', decisionRemark: !approve ? remark : undefined }) });
      if (!r.ok) throw new Error('Action failed');
      if (!approve && remark) {
        await fetch(`${API_BASE_URL}/employment-records/${record._id}`, { method: 'PATCH', headers, body: JSON.stringify({ action: 'addNote', text: `Termination rejected: ${remark}` }) }).catch(()=>{});
      }
      message.success('Updated');
      if (typeof window !== 'undefined') window.location.reload();
    } catch (e) { message.error(e.message || 'Failed'); }
  }

  const emp = detail?.employment || record || {};
  const job = detail?.job || null;
  const app = detail?.application || null;

  const pendingEC = detail?.latestRequests?.earlyCompletion && detail.latestRequests.earlyCompletion.status === 0;
  const pendingTerm = detail?.termination && detail.termination.status === 0;

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Descriptions bordered column={1} size="small">
        <Descriptions.Item label="Candidate">{names[String(emp?.userId)] || emp?.userId || '-'}</Descriptions.Item>
        <Descriptions.Item label="Job">{job?.title || emp?.jobListingId || '-'}</Descriptions.Item>
        <Descriptions.Item label="Status">{statusText(emp?.status)} {emp?.status === 3 ? <Tag color="green">Completed</Tag> : null}</Descriptions.Item>
        <Descriptions.Item label="Start Date">{emp?.startDate ? new Date(emp.startDate).toLocaleString() : '-'}</Descriptions.Item>
        <Descriptions.Item label="End Date">{emp?.endDate ? new Date(emp.endDate).toLocaleString() : '-'}</Descriptions.Item>
      </Descriptions>

      {/* Requests panel for company decision */}
      {(pendingEC || pendingTerm) && (
        <Alert type="info" showIcon message="Pending request(s)" description={
          <Space direction="vertical">
            {pendingEC && (
              <div>
                Early completion request pending
                <div>
                  <Space>
                    <Button size="small" type="primary" onClick={()=>decideEarlyCompletion(detail.latestRequests.earlyCompletion._id, true)}>Approve</Button>
                    <Button size="small" danger onClick={()=>{ setRejectModal({ open:true, kind:'ec', id: detail.latestRequests.earlyCompletion._id }); }}>Reject</Button>
                  </Space>
                </div>
              </div>
            )}
            {pendingTerm && (
              <div>
                Termination request pending
                <div>
                  <Space>
                    <Button size="small" type="primary" onClick={()=>decideTermination(detail.termination._id, true)}>Approve</Button>
                    <Button size="small" danger onClick={()=>{ setRejectModal({ open:true, kind:'term', id: detail.termination._id }); }}>Reject</Button>
                  </Space>
                </div>
              </div>
            )}
          </Space>
        } />
      )}

        <Space>
        {emp?.status === 0 && (
          <Button type="primary" onClick={() => patchEmployment('startNow')}>Start now</Button>
        )}
        {emp?.status === 1 && (()=>{
          const req = detail?.onboarding?.requiredDocs || [];
          const docs = detail?.onboarding?.docs || [];
          const verifiedTypes = new Set(docs.filter(d=>d.verified).map(d=>d.type));
          const canMoveToClosure = req.every(rt => verifiedTypes.has(rt));
          return (
            <Button onClick={() => setCloseOpen(true)} disabled={!canMoveToClosure} title={!canMoveToClosure ? 'Verify all required documents before completing internship' : undefined}>
              Complete internship
            </Button>
          );
        })()}
        {emp?.status === 2 && (
          <Button type="primary" onClick={() => patchEmployment('complete')}>Mark completed</Button>
        )}
        {[0,1,2].includes(emp?.status) && (
          <Button danger onClick={() => { setTermOpen(true); }}>Terminate</Button>
        )}
      </Space>


      {/* Job onboarding materials from job listing */}
      {Array.isArray(job?.onboardingMaterials) && job.onboardingMaterials.length > 0 && (
        <div>
          <Divider>Job onboarding materials</Divider>
          <List size="small" dataSource={job.onboardingMaterials}
            renderItem={(m) => (
              <List.Item>
                <Space>
                  <Tag>{m.type || 'doc'}</Tag>
                  <span>{m.label || m.fileKey}</span>
                  {m.fileKey ? (
                    <Button size="small" onClick={async()=>{
                      try {
                        const token = localStorage.getItem('jf_token');
                        const r = await fetch(`${API_BASE_URL}/upload/${encodeURIComponent(m.fileKey)}`, { headers: { Authorization: `Bearer ${token}` } });
                        if (r.ok) { const j = await r.json(); const url = j.signedUrl || j.publicUrl; if (url) window.open(url, '_blank'); }
                      } catch (_) {}
                    }}>View</Button>
                  ) : null}
                </Space>
              </List.Item>
            )}
          />
        </div>
      )}

      {/* Uploaded docs with View button */}
      {Array.isArray(detail?.onboarding?.docs) && detail.onboarding.docs.length > 0 && (
        <div>
          <h4 style={{ marginBottom: 8 }}>Uploaded Docs</h4>
          <List size="small" dataSource={detail.onboarding.docs} renderItem={(d) => (
            <List.Item>
              <Space>
                <Tag>{d.type}</Tag>
                <span>{d.fileKey}</span>
                <Tag color={d.verified ? 'green' : 'orange'}>{d.verified ? 'Verified' : 'Pending'}</Tag>
                {d.fileKey ? (
                  <Button size="small" onClick={async()=>{
                    try {
                      const token = localStorage.getItem('jf_token');
                      const r = await fetch(`${API_BASE_URL}/upload/${encodeURIComponent(d.fileKey)}`, { headers: { Authorization: `Bearer ${token}` } });
                      if (r.ok) { const j = await r.json(); const url = j.signedUrl || j.publicUrl; if (url) window.open(url, '_blank'); }
                    } catch (_) {}
                  }}>View</Button>
                ) : null}
              </Space>
            </List.Item>
          )} />
        </div>
      )}

      {/* Remarks list with author names */}
      {Array.isArray(detail?.notes) && detail.notes.length > 0 && (
        <div>
          <h4 style={{ marginBottom: 8 }}>Remarks</h4>
          <List size="small" dataSource={detail.notes}
            renderItem={(n) => (
              <List.Item>
                <Space>
                  <span>{new Date(n.at).toLocaleString()}</span>
                  <Tag>{names[String(n.byUserId)] || n.byUserId}</Tag>
                  <Paragraph style={{ margin: 0 }}>{n.text}</Paragraph>
                </Space>
              </List.Item>
            )}
          />
        </div>
      )}

      {/* Complete internship modal (move to closure) */}
      <Modal title="Complete internship" open={closeOpen} onCancel={()=>{ setCloseOpen(false); }} onOk={async ()=>{
        try{
          const v = await closeForm.validateFields();
          if (v.remark) { await patchEmployment('addNote', { text: v.remark }); }
          await patchEmployment('moveToClosure');
          setCloseOpen(false); closeForm.resetFields();
        } catch(e){ if (e?.errorFields) return; }
      }} okText="Move to closure">
        <Form layout="vertical" form={closeForm}>
          <Form.Item label="Completion remark (optional)" name="remark">
            <Input.TextArea rows={3} placeholder="Remark to record for completion" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Reject request modal */}
      <Modal title="Reject request" open={rejectModal.open} onCancel={()=>{ setRejectModal({ open:false, kind:null, id:null }); rejectForm.resetFields(); }} onOk={async()=>{
        const v = await rejectForm.validateFields();
        if (rejectModal.kind === 'ec') await decideEarlyCompletion(rejectModal.id, false, v.remark);
        if (rejectModal.kind === 'term') await decideTermination(rejectModal.id, false, v.remark);
        setRejectModal({ open:false, kind:null, id:null }); rejectForm.resetFields();
      }} okButtonProps={{ danger: true }} okText="Reject">
        <Form form={rejectForm} layout="vertical">
          <Form.Item label="Rejection remark" name="remark" rules={[{ required: true, message: 'Please enter a remark' }]}>
            <Input.TextArea rows={3} placeholder="Explain the rejection" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Onboarding / required docs */}
      {Array.isArray((detail?.onboarding?.requiredDocs)) && (
        <Descriptions title="Required Documents" bordered column={1} size="small">
          <Descriptions.Item label="Types">{detail.onboarding.requiredDocs.join(', ') || '-'}</Descriptions.Item>
        </Descriptions>
      )}

      {/* Application details & history */}
      {app && (
        <div>
          <Divider>Application</Divider>
          <Descriptions bordered size="small" column={1}>
            <Descriptions.Item label="Application ID">{app._id}</Descriptions.Item>
            <Descriptions.Item label="Current status">{app.status}</Descriptions.Item>
            <Descriptions.Item label="Letter of offer">{offerUrl ? <a href={offerUrl} target="_blank" rel="noreferrer">View letter</a> : (app?.offer?.letterKey ? 'Resolving…' : '-')}</Descriptions.Item>
          </Descriptions>
          {Array.isArray(detail?.applicationHistory) && detail.applicationHistory.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <h4 style={{ marginBottom: 8 }}>Application status update history</h4>
              <List size="small" dataSource={detail.applicationHistory} renderItem={(h) => (
                <List.Item>
                  <Space>
                    <span>{new Date(h.at).toLocaleString()}</span>
                    <Tag>{h.action}</Tag>
                    {h.note ? <Paragraph style={{ margin: 0 }}>{h.note}</Paragraph> : null}
                  </Space>
                </List.Item>
              )} />
            </div>
          )}
        </div>
      )}

      <Modal title="Terminate internship" open={termOpen} onCancel={()=>{ setTermOpen(false); }} onOk={terminateEmployment} okText="Terminate" okButtonProps={{ danger: true }}>
        <Form layout="vertical" form={termForm}>
          <Form.Item label="Termination reason" name="reason" rules={[{ required: true, message: 'Please enter a reason' }]}>
            <Input.TextArea rows={3} placeholder="Reason for termination" />
          </Form.Item>
          <Form.Item label="Proposed last working day" name="lastDay">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Remark (optional)" name="remark">
            <Input.TextArea rows={3} placeholder="Remarks to keep in record" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Termination details when terminated */}
      {emp?.status === 4 && detail?.termination && (
        <div>
          <Divider>Termination details</Divider>
          <Descriptions bordered size="small" column={1}>
            <Descriptions.Item label="Terminated by">{detail.termination.initiatedBy || '-'}</Descriptions.Item>
            <Descriptions.Item label="Termination reason">{detail.termination.reason || '-'}</Descriptions.Item>
            <Descriptions.Item label="Termination remark">{detail.termination.remark || '-'}</Descriptions.Item>
            <Descriptions.Item label="Decided at">{detail.termination.decidedAt ? new Date(detail.termination.decidedAt).toLocaleString() : '-'}</Descriptions.Item>
          </Descriptions>
        </div>
      )}
    </Space>
  );
}

