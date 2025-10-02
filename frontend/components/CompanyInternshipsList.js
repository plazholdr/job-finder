"use client";
import { Card, List, Typography, Tag, Space, Empty, Divider } from 'antd';
import Link from 'next/link';
import {
  CalendarOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { formatDistanceToNow } from 'date-fns';

const { Title, Text, Paragraph } = Typography;

export default function CompanyInternshipsList({ company, jobs }) {
  // Prefer normalized job-listings from API; fall back to embedded internships
  const records = Array.isArray(jobs) && jobs.length ? jobs : (company.internships || []);

  const formatSalaryRange = (salaryRange) => {
    if (!salaryRange || (!salaryRange.min && !salaryRange.max)) return null;
    const formatAmount = (amount) => (amount ? `RM ${Number(amount).toLocaleString()}` : '');
    if (salaryRange.min && salaryRange.max) return `${formatAmount(salaryRange.min)} - ${formatAmount(salaryRange.max)}`;
    if (salaryRange.min) return `From ${formatAmount(salaryRange.min)}`;
    if (salaryRange.max) return `Up to ${formatAmount(salaryRange.max)}`;
    return null;
  };

  const getPostedAt = (item) => item.publishAt || item.approvedAt || item.postedAt || item.createdAt;

  const formatLocation = (item) => {
    const loc = item.location || {};
    if (typeof item.location === 'string') return item.location;
    const parts = [loc.city, loc.state].filter(Boolean);
    return parts.length ? parts.join(', ') : (item.project?.locations?.[0] || null);
  };

  const formatDuration = (item) => {
    const s = item.project?.startDate && new Date(item.project.startDate);
    const e = item.project?.endDate && new Date(item.project.endDate);
    if (s && e && !isNaN(s) && !isNaN(e)) {
      const months = Math.max(1, Math.round((e - s) / (1000 * 60 * 60 * 24 * 30)));
      return `${months} month${months > 1 ? 's' : ''}`;
    }
    return item.duration || null;
  };

  const formatPostedDate = (date) => {
    if (!date) return 'Recently posted';
    try { return formatDistanceToNow(new Date(date), { addSuffix: true }); }
    catch { return 'Recently posted'; }
  };

  if (records.length === 0) {
    return (
      <Card
        title={<Title level={4} style={{ margin: 0 }}>Internship Opportunities</Title>}
        style={{ minHeight: '600px', display: 'flex', flexDirection: 'column' }}
        bodyStyle={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Empty description="No internship opportunities available at the moment" style={{ padding: '40px 0' }} />
      </Card>
    );
  }

  return (
    <Card
      title={<Title level={4} style={{ margin: 0 }}>Internship Opportunities</Title>}
      style={{ minHeight: '600px' }}
    >
      <List
        itemLayout="vertical"
        dataSource={records}
        split={false}
        renderItem={(item, index) => (
          <div key={index}>
            <List.Item style={{ padding: '16px 0' }}>
              <div>
                {/* Job Title */}
                <Title level={5} style={{ margin: 0, marginBottom: 8 }}>
                  { (item._id || item.id) ? (
                    <Link href={`/jobs/${item._id || item.id}`} style={{ color: 'black' }} aria-label={`View ${item.title || 'job'}`}>
                      {item.title || 'Internship Position'}
                    </Link>
                  ) : (
                    <span style={{ color: 'black' }}>{item.title || 'Internship Position'}</span>
                  )}
                </Title>

                {/* Job Details Tags */}
                <Space wrap style={{ marginBottom: 12 }}>
                  {formatDuration(item) && (
                    <Tag icon={<ClockCircleOutlined />} color="blue">{formatDuration(item)}</Tag>
                  )}
                  {formatLocation(item) && (
                    <Tag icon={<EnvironmentOutlined />} color="green">{formatLocation(item)}</Tag>
                  )}
                  {formatSalaryRange(item.salaryRange) && (
                    <Tag icon={<DollarOutlined />} color="gold">{formatSalaryRange(item.salaryRange)}</Tag>
                  )}
                  <Tag icon={<CalendarOutlined />} color="default">{formatPostedDate(getPostedAt(item))}</Tag>
                </Space>

                {/* Job Description */}
                {item.description && (
                  <Paragraph style={{ marginBottom: 0, color: '#666', fontSize: '14px', lineHeight: '1.6' }}
                            ellipsis={{ rows: 3, expandable: true, symbol: 'Read more' }}>
                    {item.description}
                  </Paragraph>
                )}
              </div>
            </List.Item>
            {index < records.length - 1 && (<Divider style={{ margin: '8px 0' }} />)}
          </div>
        )}
      />
    </Card>
  );
}
