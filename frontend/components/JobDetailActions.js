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
      <Button type="primary" onClick={goApply}>Apply</Button>
    </Space>
  );
}

