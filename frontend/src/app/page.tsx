'use client';

import { Button, Typography } from 'antd';

const { Title } = Typography;

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <Title level={1}>Job Finder</Title>
      <p className="mb-4">Find your dream job with Job Finder</p>
      <Button type="primary">Get Started</Button>
    </main>
  );
}
