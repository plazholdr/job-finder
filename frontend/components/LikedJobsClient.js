"use client";
import { useEffect, useState } from 'react';
import { List, Card, Typography, Tag, Space, Button, Skeleton, Empty, App } from 'antd';
import Link from 'next/link';
import { apiAuth, apiGet } from '../lib/api';

const { Title, Paragraph, Text } = Typography;

export default function LikedJobsClient() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]); // [{ job, likedAt, likedId }]
  const { message } = App.useApp();

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const likedRaw = await apiAuth('/liked-jobs', { method: 'GET' });
        const likedList = Array.isArray(likedRaw?.data) ? likedRaw.data : (Array.isArray(likedRaw) ? likedRaw : []);
        const jobs = await Promise.all(likedList.map(async rec => {
          try { const job = await apiGet(`/job-listings/${rec.jobListingId}`); return { job, likedAt: rec.createdAt, likedId: rec._id || rec.id }; }
          catch { return null; }
        }));
        if (!mounted) return;
        setItems(jobs.filter(Boolean));
      } catch (e) {
        if (mounted) message.error('Failed to load liked jobs.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [message]);

  async function handleUnlike(jobId, likedId) {
    try {
      if (likedId) {
        await apiAuth(`/liked-jobs/${likedId}`, { method: 'DELETE' });
      } else {
        const res = await apiAuth(`/liked-jobs?jobListingId=${jobId}`, { method: 'GET' });
        const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        if (list?.[0]?._id) await apiAuth(`/liked-jobs/${list[0]._id}`, { method: 'DELETE' });
      }
      setItems(prev => prev.filter(it => it.job?._id !== jobId));
      message.success('Removed Like');
    } catch (_) {
      message.error('Failed to unlike. Please try again.');
    }
  }

  if (loading) {
    return <Card><Skeleton active /></Card>;
  }

  if (!items.length) {
    return (
      <Card>
        <Empty description="No liked jobs yet" />
      </Card>
    );
  }

  return (
    <Card>
      <List
        itemLayout="vertical"
        dataSource={items}
        renderItem={(it) => (
          <List.Item key={it.job._id}
            extra={<Button onClick={() => handleUnlike(it.job._id, it.likedId)}>Unlike</Button>}>
            <div>
              <Title level={5} style={{ margin: 0, marginBottom: 8 }}>
                <Link href={`/jobs/${it.job._id}`} style={{ color: '#1677ff' }}>{it.job.title}</Link>
              </Title>
              {it.job.description && (
                <Paragraph ellipsis={{ rows: 2 }}>{it.job.description}</Paragraph>
              )}
              <Space wrap>
                {it.job.location?.city || it.job.location?.state ? (
                  <Tag>{[it.job.location?.city, it.job.location?.state].filter(Boolean).join(', ')}</Tag>
                ) : null}
                {it.job.salaryRange && (it.job.salaryRange.min || it.job.salaryRange.max) && (
                  <Tag color="gold">RM {it.job.salaryRange.min ?? 0}{it.job.salaryRange.max ? ` - RM ${it.job.salaryRange.max}` : ''}</Tag>
                )}
                {it.likedAt && <Text type="secondary">Liked {new Date(it.likedAt).toLocaleDateString()}</Text>}
              </Space>
            </div>
          </List.Item>
        )}
      />
    </Card>
  );
}

