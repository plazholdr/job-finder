"use client";
import { useState } from 'react';
import { Typography, Input, Button, Space, Select, theme as antdTheme, Col, Row } from 'antd';

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
    <div style={{ padding: '56px 24px', background: bg }}>
      <Row style={{ width: '100%'}}>
        <Col xs={24} md={12} lg={12} xl={12} style={{ paddingLeft: 150}}>
        <Typography.Title level={1} style={{ marginBottom: 8, marginTop: 100, fontWeight: 700 }}>Find Internships And Hire Talents!</Typography.Title>
        <Typography.Text style={{ fontSize: '1.5rem', fontWeight: 400, color: '#666', marginTop: 20 }}>Browse active jobs and approved companies</Typography.Text>
        </Col>
        <Col xs={24} md={12} lg={12} xl={12}>
          <div
            style={{
              height: 'clamp(260px, 45vh, 520px)',
              width: '100%',
              backgroundImage: 'url(/images/company-registration.png)',
              backgroundSize: 'contain',
              backgroundPosition: 'right top',
              backgroundRepeat: 'no-repeat'
            }}
          />

        </Col>
      </Row>
      <div style={{ maxWidth: 900, margin: '24px auto 0' }}>
        <Space.Compact style={{ width: '100%', marginTop: 80 }}>
          <Input placeholder="Search skills, company or job title" value={q} onChange={(e)=>setQ(e.target.value)} style={{ borderRadius: 20, padding: 10, boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)" }}/>
          <Button type="primary" onClick={handleSubmit} style={{borderRadius: 20, background: 'linear-gradient(to right, #7d69ff, #917fff)', marginLeft: 8, padding: 20, boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)" }}>Search</Button>
        </Space.Compact>
      </div>
    </div>
  );
}

