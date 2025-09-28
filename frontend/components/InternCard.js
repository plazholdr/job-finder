import React from 'react';
import { Card, Avatar, Typography, Tag, Space } from 'antd';

const { Title, Text } = Typography;

export default function InternCard({ intern }) {
  const name = `${intern?.profile?.firstName || ''} ${intern?.profile?.lastName || ''}`.trim() || intern?.email || 'Intern';
  const edu = intern?.internProfile?.educations?.[0] || {};
  const field = edu?.fieldOfStudy || edu?.qualification || '-';
  const prefs = intern?.internProfile?.preferences || {};
  const s = prefs?.preferredStartDate ? new Date(prefs.preferredStartDate).toLocaleDateString() : '-';
  const e = prefs?.preferredEndDate ? new Date(prefs.preferredEndDate).toLocaleDateString() : '-';
  const locs = Array.isArray(prefs?.locations) ? prefs.locations.slice(0, 3) : [];
  const sal = prefs?.salaryRange || {};

  return (
    <Card hoverable>
      <Space align="start" size="large">
        <Avatar size={56} src={intern?.profile?.avatar}>{name.charAt(0)}</Avatar>
        <div>
          <Title level={5} style={{ margin: 0 }}>{name}</Title>
          <Text type="secondary">{field}</Text>
          <div style={{ marginTop: 8 }}>
            <Text type="secondary">{s} 	→	 {e}</Text>
          </div>
          <div style={{ marginTop: 8 }}>
            {locs.map((l) => <Tag key={l}>{l}</Tag>)}
          </div>
          <div style={{ marginTop: 8 }}>
            <Text type="secondary">{(sal.min != null || sal.max != null) ? `RM ${sal.min || 0} - ${sal.max || 0}` : '-'}</Text>
          </div>
        </div>
      </Space>
    </Card>
  );
}

