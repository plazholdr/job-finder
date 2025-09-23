"use client";
import { Button, Space, message } from "antd";
import { apiAuth } from "../lib/api";

export default function CompanyActions({ companyId }) {
  async function like() {
    try { await apiAuth('/liked-companies', { method: 'POST', body: { companyId } }); message.success('Added to likes'); }
    catch (err) { if (/Not signed/.test(err.message)) message.info('Please sign in'); else message.error('Action failed'); }
  }
  async function save() {
    try { await apiAuth('/saved-companies', { method: 'POST', body: { companyId } }); message.success('Saved'); }
    catch (err) { if (/Not signed/.test(err.message)) message.info('Please sign in'); else message.error('Action failed'); }
  }
  return (
    <Space>
      <Button onClick={save}>Save</Button>
      <Button onClick={like} type="primary">Like</Button>
    </Space>
  );
}

