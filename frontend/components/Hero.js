"use client";
import { useState } from 'react';
import { Typography, Input, Button, Space, Select, theme as antdTheme } from 'antd';

import { useTheme } from './Providers';

export default function Hero({ onSearch, industryOptions = [] }) {
  const { theme } = useTheme();
  const { token } = antdTheme.useToken();
  const [q, setQ] = useState("");
  const bg = theme === 'dark' ? 'linear-gradient(180deg,#0b1220 0%, #0d1325 100%)' : 'linear-gradient(135deg,#f0f5ff,#fff)';

  function handleSubmit() {
    if (typeof onSearch === 'function') onSearch({ q });
  }

  return (
    <div style={{ padding: '56px 24px', background: bg, textAlign: 'center' }}>
      <Typography.Title level={2} style={{ marginBottom: 8 }}>Find internships and hire talent</Typography.Title>
      <Typography.Text>Browse active jobs and approved companies</Typography.Text>
      <div style={{ maxWidth: 900, margin: '24px auto 0' }}>
        <Space.Compact style={{ width: '100%' }}>
          <Input placeholder="Search skills, company or job title" value={q} onChange={(e)=>setQ(e.target.value)} />
          <Button type="primary" onClick={handleSubmit}>Search</Button>
        </Space.Compact>
      </div>
    </div>
  );
}

