"use client";
import { useEffect, useState } from 'react';
import { Card, Tag, Typography, Button, Space, App, Modal, Divider, theme as antdTheme } from 'antd';
import { HeartOutlined, HeartFilled, BookOutlined, BookFilled, EnvironmentOutlined, DollarOutlined, ClockCircleOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { apiAuth, getToken } from '../lib/api';
import AuthPromptModal from './AuthPromptModal';
import { API_BASE_URL } from '../config';

const { Text } = Typography;

export default function JobCard({ job, companyView = false }) {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { message } = App.useApp();
  const { token } = antdTheme.useToken();
  const [saved, setSaved] = useState(false);
  const [savedId, setSavedId] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likedId, setLikedId] = useState(null);
  const [authModalConfig, setAuthModalConfig] = useState({});
  const [logoSignedUrl, setLogoSignedUrl] = useState(null);
  const [logoError, setLogoError] = useState(false);
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

  // Load company logo with signed URL
  useEffect(() => {
    async function loadLogo() {
      let logoUrl = job.company?.logo || job.company?.logoUrl || job.companyLogo;
      if (!logoUrl && job.company?.logoKey) {
        logoUrl = `${process.env.NEXT_PUBLIC_STORAGE_URL || 'https://ap-southeast-mys1.oss.ips1cloud.com/job-finder-bucket'}/${job.company.logoKey}`;
      }

      if (logoUrl) {
        try {
          const res = await fetch(`${API_BASE_URL}/signed-url?url=${encodeURIComponent(logoUrl)}`);
          if (res.ok) {
            const data = await res.json();
            setLogoSignedUrl(data.signedUrl);
          } else {
            setLogoSignedUrl(logoUrl);
          }
        } catch (e) {
          setLogoSignedUrl(logoUrl);
        }
      }
    }
    loadLogo();
  }, [job.company?.logo, job.company?.logoUrl, job.company?.logoKey, job.companyLogo]);

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

  // Calculate days ago
  const daysAgo = (() => {
    const posted = job.approvedAt || job.createdAt;
    if (!posted) return 0;
    const now = new Date();
    const postedDate = new Date(posted);
    const diff = Math.floor((now.getTime() - postedDate.getTime()) / (24 * 60 * 60 * 1000));
    return diff;
  })();

  // Format salary
  const formatSalary = () => {
    if (!job.salaryRange || (!job.salaryRange.min && !job.salaryRange.max)) return 'Not specified';
    const min = job.salaryRange.min ? `RM ${job.salaryRange.min.toLocaleString()}` : '';
    const max = job.salaryRange.max ? `RM ${job.salaryRange.max.toLocaleString()}` : '';
    if (min && max) return `${min} - ${max}`;
    return min || max;
  };

  return (
    <Card
      hoverable
      onClick={handleCardClick}
      style={{
        cursor: 'pointer',
        transition: 'all 0.2s',
        border: `1px solid ${token.colorBorder}`,
        backgroundColor: token.colorBgContainer
      }}
      styles={{ body: { padding: '24px' } }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Header with logo and actions */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', gap: 16, flex: 1 }}>
            {/* Company Logo */}
            {logoSignedUrl && !logoError ? (
              <img
                src={logoSignedUrl}
                alt={companyName}
                onError={() => setLogoError(true)}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 8,
                  objectFit: 'cover',
                  border: `1px solid ${token.colorBorder}`
                }}
              />
            ) : (
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 8,
                  backgroundColor: token.colorBgLayout,
                  border: `1px solid ${token.colorBorder}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  fontWeight: 600,
                  color: token.colorTextTertiary,
                  flexShrink: 0
                }}
              >
                {companyName.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Job Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ fontSize: 20, fontWeight: 600, color: token.colorText, margin: '0 0 4px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {job.title}
              </h3>
              <p style={{ fontSize: 16, color: token.colorTextSecondary, margin: '0 0 8px 0' }}>{companyName}</p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 14, color: token.colorTextSecondary }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <EnvironmentOutlined style={{ color: token.colorTextTertiary }} />
                  {job.location?.city || job.location?.state ?
                    [job.location?.city, job.location?.state].filter(Boolean).join(', ') :
                    'Location not specified'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <DollarOutlined style={{ color: token.colorTextTertiary }} />
                  {formatSalary()}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <AppstoreOutlined style={{ color: token.colorTextTertiary }} />
                  {job.company?.industry || 'Industry not specified'}
                </span>
              </div>
            </div>
          </div>

          {/* Like and Save buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              type="text"
              icon={liked ? <HeartFilled style={{ color: '#ff4d4f', fontSize: 20 }} /> : <HeartOutlined style={{ fontSize: 20 }} />}
              onClick={handleLike}
              style={{ padding: '4px 8px' }}
            />
            <Button
              type="text"
              icon={saved ? <BookFilled style={{ color: '#1890ff', fontSize: 20 }} /> : <BookOutlined style={{ fontSize: 20 }} />}
              onClick={handleSave}
              style={{ padding: '4px 8px' }}
            />
          </div>
        </div>

        {/* Description */}
        <p style={{ color: token.colorTextSecondary, fontSize: 14, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {job.description}
        </p>

        {/* Skills/Tags */}
        {job.company?.industry && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <Tag style={{ margin: 0, padding: '4px 12px', fontSize: 12, borderRadius: 4 }}>
              {job.company.industry}
            </Tag>
            {job?.project?.startDate && job?.project?.endDate && (
              <Tag style={{ margin: 0, padding: '4px 12px', fontSize: 12, borderRadius: 4 }}>
                {(() => {
                  const s = new Date(job.project.startDate);
                  const e = new Date(job.project.endDate);
                  const months = Math.round(((e - s) / (1000*60*60*24*30)));
                  return `${months} month${months===1?'':'s'} duration`;
                })()}
              </Tag>
            )}
          </div>
        )}

        <Divider style={{ margin: '8px 0' }} />

        {/* Footer with date and actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: token.colorTextTertiary }}>
            <ClockCircleOutlined style={{ fontSize: 14 }} />
            <span>Posted {daysAgo === 0 ? 'today' : `${daysAgo} ${daysAgo === 1 ? 'day' : 'days'} ago`}</span>
          </div>
          <Space>
            <Button size="large" onClick={(e) => { e.stopPropagation(); handleCardClick(); }}>
              View Details
            </Button>
            <Button type="primary" size="large" onClick={(e) => { e.stopPropagation(); handleCardClick(); }}>
              Apply Now
            </Button>
          </Space>
        </div>

        {/* Company view specific content */}
        {companyView && (
          <>
            {/* Status/expiry notice */}
            {job.status !== 2 && (
              <div style={{ marginTop: 8 }}>
                <Tag color={statusColor(job.status)}>{statusLabel(job.status)}</Tag>
              </div>
            )}

            {/* Rejection reason */}
            {job.status === 0 && (job.preApprovalRejectionReason || job.rejectionReason) && (
              <div style={{
                padding: '8px 12px',
                border: '1px solid #ff4d4f',
                borderRadius: 6,
                background: token.colorErrorBg || '#fff1f0',
                marginTop: 8
              }}>
                <Text type="danger" strong>Rejection Reason:</Text>
                <Typography.Paragraph style={{ margin: '4px 0 0 0', color: token.colorText }}>
                  {job.preApprovalRejectionReason || job.rejectionReason}
                </Typography.Paragraph>
              </div>
            )}

            {/* Expiry notice */}
            {job.status === 2 && daysLeft != null && daysLeft <= 7 && (
              <div style={{
                padding: '8px 12px',
                border: `1px dashed ${token.colorBorder}`,
                borderRadius: 6,
                background: token.colorBgLayout,
                marginTop: 8
              }}>
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
          </>
        )}

        {/* Company view action buttons */}
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
      </div>

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

