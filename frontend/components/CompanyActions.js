"use client";
import { Button, Space, message } from "antd";
import { apiAuth } from "../lib/api";

export default function CompanyActions({ companyId }) {
  async function like() {
    try { await apiAuth('/favorites', { method: 'POST', body: { companyId } }); message.success('Added to favorites'); }
    catch (err) { if (/Not signed/.test(err.message)) message.info('Please sign in'); else message.error('Action failed'); }
  }
  return (
    <Space>
      <Button onClick={like} type="primary">Like</Button>
    </Space>
  );
}

