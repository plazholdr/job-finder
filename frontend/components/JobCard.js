"use client";
import { Card, Tag, Typography, Button, Space, message } from 'antd';
import Link from 'next/link';
import { apiAuth } from '../lib/api';

export default function JobCard({ job }) {
  const companyName = job.company?.name || job.companyName || 'Company';

  async function handleSave(e){
    e.preventDefault(); e.stopPropagation();
    try { await apiAuth('/saved-jobs', { method: 'POST', body: { jobId: job._id } }); message.success('Saved'); }
    catch(err){ if(/Not signed/.test(err.message)) message.info('Please sign in to save'); else message.error('Save failed'); }
  }
  async function handleLike(e){
    e.preventDefault(); e.stopPropagation();
    try { await apiAuth('/liked-jobs', { method: 'POST', body: { jobId: job._id } }); message.success('Liked'); }
    catch(err){ if(/Not signed/.test(err.message)) message.info('Please sign in to like'); else message.error('Like failed'); }
  }

  return (
    <Card hoverable title={<Link href={`/jobs/${job._id}`}>{job.title}</Link>} extra={<span>{companyName}</span>}>
      <Typography.Paragraph ellipsis={{ rows: 2 }}>{job.description}</Typography.Paragraph>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
        {job.locations?.slice(0, 3).map((loc, i) => (
          <Tag key={i}>{loc}</Tag>
        ))}
      </div>
      <Space>
        <Button size="small" onClick={handleSave}>Save</Button>
        <Button size="small" onClick={handleLike}>Like</Button>
      </Space>
    </Card>
  );
}

