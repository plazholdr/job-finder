"use client";
import { Button, Space, message } from "antd";

export default function JobDetailActions({ jobId }) {
  return (
    <Space>
      <Button type="primary" onClick={() => message.info('Please sign in to apply')}>Apply</Button>
      <Button onClick={() => message.info('Please sign in to save')}>Save</Button>
      <Button onClick={() => message.info('Please sign in to like')}>Like</Button>
    </Space>
  );
}

