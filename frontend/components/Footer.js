"use client";
import { Layout } from 'antd';

export default function Footer() {
  return (
    <Layout.Footer style={{ textAlign: 'center' }}>
      © {new Date().getFullYear()} Job Finder
    </Layout.Footer>
  );
}

