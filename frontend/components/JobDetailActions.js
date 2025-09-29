"use client";
import { Button, Space, message } from "antd";
import { useRouter } from 'next/navigation';
import { getToken } from '../lib/api';

export default function JobDetailActions({ jobId }) {
  const router = useRouter();

  function goApply() {
    if (!getToken()) {
      message.info('Please sign in to apply');
      router.push(`/login?next=/jobs/${jobId}/apply`);
      return;
    }
    router.push(`/jobs/${jobId}/apply`);
  }

  return (
    <Space>
      <Button type="primary" onClick={goApply} style={{ background: 'linear-gradient(to right, #7d69ff, #917fff)', border: 'none', borderRadius: '25px', fontSize: '16px', fontWeight: '600', padding: '8px 25px', height: 'auto', boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)" }}>Apply For Position</Button>
    </Space>
  );
}

