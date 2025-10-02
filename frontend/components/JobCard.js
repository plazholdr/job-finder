"use client";
import { useEffect, useState } from 'react';
import { Card, Tag, Typography, Button, Space, App, Modal, Avatar } from 'antd';
import { SaveOutlined, CheckOutlined, LikeOutlined, BankOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { apiAuth, getToken } from '../lib/api';
import AuthPromptModal from './AuthPromptModal';

export default function JobCard({ job, companyView = false }) {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { message } = App.useApp();
  const [saved, setSaved] = useState(false);
  const [savedId, setSavedId] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likedId, setLikedId] = useState(null);
  const [authModalConfig, setAuthModalConfig] = useState({});
  const router = useRouter();
  const companyName = job.company?.name || job.companyName || 'Company';

  const statusLabel = (s) => {
    switch (s) {
      case 0: return 'Draft';
      case 1: return 'Pending Final Approval';
      case 2: return 'Active';
      case 3: return 'Closed';
      case 4: return 'Pending Pre-Approval';
      case 5: return 'Pre-Approved';
      default: return '';
    }
  };

  const statusColor = (s) => {
    switch (s) {
      case 0: return 'default';
      case 1: return 'orange';
      case 2: return 'green';
      case 3: return 'red';
      case 4: return 'blue';
      case 5: return 'cyan';
      default: return 'default';
    }
  };

  const daysLeft = (() => {
    if (!job?.expiresAt) return null;
    const now = new Date();
    const exp = new Date(job.expiresAt);
    const diff = Math.ceil((exp.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    return diff;
  })();

  function handleCardClick() {
    if (companyView) {
      router.push(`/company/jobs/${job._id}`);
    } else {
      router.push(`/jobs/${job._id}`);
    }
  }

  useEffect(() => {
    // Preload saved and liked state for this job
    (async () => {
      if (!getToken()) return;
      try {
        const s = await apiAuth(`/saved-jobs?jobListingId=${job._id}`, { method: 'GET' });
        const savedList = Array.isArray(s?.data) ? s.data : (Array.isArray(s) ? s : []);
        if ((savedList || []).length > 0) { setSaved(true); setSavedId(savedList[0]._id); } else { setSaved(false); setSavedId(null); }
      } catch (_) { /* ignore */ }
      try {
        const l = await apiAuth(`/liked-jobs?jobListingId=${job._id}`, { method: 'GET' });
        const likedList = Array.isArray(l?.data) ? l.data : (Array.isArray(l) ? l : []);
        if ((likedList || []).length > 0) { setLiked(true); setLikedId(likedList[0]._id); } else { setLiked(false); setLikedId(null); }
      } catch (_) { /* ignore */ }
    })();
  }, [job._id]);

  async function handleSave(e){
    e.preventDefault(); e.stopPropagation();

    // Check if user is signed in
    if (!getToken()) {
      setAuthModalConfig({
        title: "Save Job",
        description: "Please sign in to save this job to your list. You'll be able to view all your saved jobs in your profile.",
        actionText: "Sign In to Save"
      });
      setAuthModalOpen(true);
      return;
    }

    try {
      if (!saved) {
        const created = await apiAuth('/saved-jobs', { method: 'POST', body: { jobListingId: job._id } });
        setSaved(true);
        setSavedId(created?._id || created?.id || null);
        message.success('Saved');
      } else {
        if (savedId) {
          await apiAuth(`/saved-jobs/${savedId}`, { method: 'DELETE' });
        } else {
          // Fallback: find then remove
          const res = await apiAuth(`/saved-jobs?jobListingId=${job._id}`, { method: 'GET' });
          const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
          if (list?.[0]?._id) await apiAuth(`/saved-jobs/${list[0]._id}`, { method: 'DELETE' });
        }
        setSaved(false);
        setSavedId(null);
        message.success('Removed from Saved');
      }
    }
    catch(err){
      message.error('Failed to update saved state. Please try again.');
    }
  }

  async function handleLike(e){
    e.preventDefault(); e.stopPropagation();

    if (!getToken()) {
      setAuthModalConfig({
        title: "Like Job",
        description: "Please sign in to add this job to your like list. Companies will receive monthly reports about candidates who liked their jobs.",
        actionText: "Sign In to Like"
      });
      setAuthModalOpen(true);
      return;
    }

    try {
      if (!liked) {
        const created = await apiAuth('/liked-jobs', { method: 'POST', body: { jobListingId: job._id } });
        setLiked(true);
        setLikedId(created?._id || created?.id || null);
        message.success('Liked');
      } else {
        if (likedId) {
          await apiAuth(`/liked-jobs/${likedId}`, { method: 'DELETE' });
        } else {
          const res = await apiAuth(`/liked-jobs?jobListingId=${job._id}`, { method: 'GET' });
          const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
          if (list?.[0]?._id) await apiAuth(`/liked-jobs/${list[0]._id}`, { method: 'DELETE' });
        }
        setLiked(false);
        setLikedId(null);
        message.success('Removed Like');
      }
    }
    catch(err){
      message.error('Failed to update like state. Please try again.');
    }
  }

  async function requestRenewal(e) {
    e?.preventDefault?.(); e?.stopPropagation?.();
    try {
      if (!getToken()) { message.error('Sign in required'); return; }
      await apiAuth(`/job-listings/${job._id}`, { method: 'PATCH', body: { requestRenewal: true } });
      message.success('Renewal requested. Awaiting operator approval.');
      // naive refresh of the page/route to fetch updated job data
      if (typeof window !== 'undefined') window.location.reload();
    } catch (err) {
      message.error('Failed to request renewal');
    }
  }

  return (
    <Card
      hoverable
      title={job.title}
      extra={<span>{companyName}</span>}
      onClick={handleCardClick}
      style={{ cursor: 'pointer', position: 'relative' }}
    >
      {/* Status/expiry notice for company view */}
      {companyView && (
        <div style={{ marginBottom: 8 }}>
          {/* Show status tag for all non-active statuses */}
          {job.status !== 2 && (
            <Tag color={statusColor(job.status)}>{statusLabel(job.status)}</Tag>
          )}

          {/* Show rejection reason if exists */}
          {job.status === 0 && (job.preApprovalRejectionReason || job.rejectionReason) && (
            <div style={{ padding: '8px 12px', border: '1px solid #ff4d4f', borderRadius: 6, background: '#fff1f0', marginTop: 8 }}>
              <Typography.Text type="danger" strong>Rejection Reason:</Typography.Text>
              <Typography.Paragraph style={{ margin: '4px 0 0 0' }}>
                {job.preApprovalRejectionReason || job.rejectionReason}
              </Typography.Paragraph>
            </div>
          )}

          {/* Expiry notice for active jobs */}
          {job.status === 2 && daysLeft != null && daysLeft <= 7 && (
            <div style={{ padding: '8px 12px', border: '1px dashed #d9d9d9', borderRadius: 6, background: '#fafafa' }}>
              <Space wrap>
                <Tag color="orange">Expiring in {Math.max(daysLeft, 0)} day{Math.max(daysLeft,0)===1?'':'s'}</Tag>
                {job.renewal ? (
                  <Tag color="blue">Renewal pending approval</Tag>
                ) : (
                  <Button size="small" type="primary" onClick={requestRenewal}>Request renewal</Button>
                )}
              </Space>
            </div>
          )}
        </div>
      )}

      {/* Quick meta */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
        {job.approvedAt || job.createdAt ? (
          <Tag>Posted {new Date(job.approvedAt || job.createdAt).toLocaleDateString()}</Tag>
        ) : null}
        {job?.project?.startDate && job?.project?.endDate ? (
          <Tag color="purple">
            {(() => {
              const s = new Date(job.project.startDate); const e = new Date(job.project.endDate);
              const months = Math.round(((e - s) / (1000*60*60*24*30)));
              return `${months} month${months===1?'':'s'}`;
            })()}
          </Tag>
        ) : null}
      </div>

      <Typography.Paragraph ellipsis={{ rows: 2 }}>{job.description}</Typography.Paragraph>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
        {job.location?.city || job.location?.state ? (
          <><Typography.Paragraph style={{ margin: 0, fontSize: '14px', color: '#666' }}><EnvironmentOutlined style={{marginRight: 5}}/>{[job.location?.city, job.location?.state].filter(Boolean).join(', ')}</Typography.Paragraph></>
          // <Tag>{[job.location?.city, job.location?.state].filter(Boolean).join(', ')}</Tag>
        ) : (
          (job.locations || []).slice(0, 3).map((loc, i) => (<Tag key={i}>{loc}</Tag>))
        )}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
        {job.salaryRange && (job.salaryRange.min || job.salaryRange.max) && (
          <Tag color="green">
            {`RM ${job.salaryRange.min ?? 0}${job.salaryRange.max ? ' - RM ' + job.salaryRange.max : ''}`}
          </Tag>
        )}
        {job.company?.industry && (
          <Tag color="blue" style={{ padding: '0px 10px 0px 10px',borderRadius: 15 }}>{job.company.industry}</Tag>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Button size="small" type={saved ? 'primary' : 'default'} icon={saved ? <CheckOutlined /> : <SaveOutlined />} onClick={handleSave}>
            {saved ? 'Saved' : 'Save'}
          </Button>
          <Button size="small" type={liked ? 'primary' : 'default'} onClick={handleLike} icon={<LikeOutlined />}>{liked ? 'Liked' : 'Like'}</Button>
        </Space>

        {/* Company Logo */}
        <Avatar
          size={48}
          src={job.company?.logo || job.companyLogo}
          icon={<BankOutlined />}
          style={{
            backgroundColor: job.company?.logo || job.companyLogo ? 'transparent' : '#f0f0f0',
            color: '#999',
            border: '1px solid #d9d9d9'
          }}
        />
      </div>

      {companyView && job.status === 0 && (
        <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
          <Button size="small" onClick={(e)=>{ e.preventDefault(); e.stopPropagation(); router.push(`/company/jobs/${job._id}/edit`); }}>
            Continue editing
          </Button>
          <Button size="small" onClick={(e)=>{ e.preventDefault(); e.stopPropagation(); router.push(`/company/jobs/${job._id}`); }}>
            View
          </Button>
        </div>
      )}
      {companyView && job.status === 1 && (
        <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
          {job.picUpdatedAt && <Tag color="blue">PIC updated</Tag>}
          <Button size="small" onClick={(e)=>{ e.preventDefault(); e.stopPropagation(); router.push(`/company/jobs/${job._id}`); }}>
            View
          </Button>
          <Button size="small" onClick={(e)=>{ e.preventDefault(); e.stopPropagation(); router.push(`/company/jobs/${job._id}?editPIC=1`); }}>
            Edit PIC
          </Button>
        </div>
      )}
      {companyView && job.status === 2 && (
        <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
          <Button size="small" onClick={(e)=>{ e.preventDefault(); e.stopPropagation(); router.push(`/company/jobs/${job._id}`); }}>View</Button>
          <Button size="small" danger onClick={(e)=>{
            e.preventDefault(); e.stopPropagation();
            Modal.confirm({
              title: 'Close this job?',
              content: 'Once closed, it will be removed from public listings.',
              okText: 'Yes, close job',
              cancelText: 'Cancel',
              onOk: async () => {
                try {
                  if (!getToken()) { message.error('Sign in required'); return; }
                  await apiAuth(`/job-listings/${job._id}`, { method: 'PATCH', body: { close: true } });
                  message.success('Job closed');
                  if (typeof window !== 'undefined') window.location.href = '/company/profile?tab=past';
                } catch (err) { message.error('Failed to close job'); }
              }
            });
          }}>Close job</Button>
        </div>
      )}

      <AuthPromptModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        title={authModalConfig.title}
        description={authModalConfig.description}
        actionText={authModalConfig.actionText}
      />
    </Card>
  );
}

