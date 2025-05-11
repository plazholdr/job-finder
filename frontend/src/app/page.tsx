'use client';

import { Button, Typography, Tag } from 'antd';
import config from '@/config';

const { Title } = Typography;

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <Title level={1}>{config.app.name}</Title>
      <p className="mb-4">Find your dream job with {config.app.name}</p>

      {/* Environment indicator */}
      <div className="mb-6">
        <Tag color={
          config.app.env === 'development' ? 'blue' :
          config.app.env === 'staging' ? 'orange' :
          config.app.env === 'uat' ? 'green' : 'default'
        }>
          {config.app.env.toUpperCase()}
        </Tag>
        <Tag color="purple">API: {config.api.baseUrl}</Tag>
        {config.features.debugMode && <Tag color="cyan">Debug Mode</Tag>}
      </div>

      <Button type="primary">Get Started</Button>

      {/* Show additional debug info in non-production environments */}
      {config.features.debugMode && (
        <div className="mt-8 p-4 bg-gray-100 rounded text-xs">
          <h3 className="font-bold mb-2">Configuration:</h3>
          <pre>{JSON.stringify(config, null, 2)}</pre>
        </div>
      )}
    </main>
  );
}
