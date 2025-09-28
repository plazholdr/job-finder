"use client";

import { Descriptions } from "antd";

export default function AdminRenewalDetails({ record }) {
  if (!record) return null;
  return (
    <Descriptions column={1} bordered size="small">
      <Descriptions.Item label="Title">{record.title}</Descriptions.Item>
      <Descriptions.Item label="Company">{record.company?.name || record.companyName || '-'}</Descriptions.Item>
      <Descriptions.Item label="Expires">{record.expiresAt ? new Date(record.expiresAt).toLocaleString() : '-'}</Descriptions.Item>
      <Descriptions.Item label="Requested At">{record.renewalRequestedAt ? new Date(record.renewalRequestedAt).toLocaleString() : '-'}</Descriptions.Item>
      <Descriptions.Item label="Status">{record.status===2?'Active':record.status===1?'Pending':record.status===3?'Past':'Draft'}</Descriptions.Item>
      <Descriptions.Item label="Publish At">{record.publishAt ? new Date(record.publishAt).toLocaleString() : '-'}</Descriptions.Item>
      <Descriptions.Item label="Approved At">{record.approvedAt ? new Date(record.approvedAt).toLocaleString() : '-'}</Descriptions.Item>
      <Descriptions.Item label="Description">{record.description || '-'}</Descriptions.Item>
    </Descriptions>
  );
}

