"use client";

import { useEffect, useState } from "react";
import { Card, Space, Segmented, Tabs, Row, Col, Skeleton, Empty, Pagination, Button } from "antd";
import Link from "next/link";
import JobCard from "../../components/JobCard";
import { API_BASE_URL } from "../../config";

export default function CompanyJobsSection({ companyId }) {
  const [jobsView, setJobsView] = useState("list");
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [total, setTotal] = useState(0);
  const [activeTab, setActiveTab] = useState("draft");

  useEffect(() => {
    let aborted = false;
    async function fetchJobs() {
      if (!companyId) return;
      try {
        setJobsLoading(true);
        const token = localStorage.getItem("jf_token");
        const skip = (page - 1) * pageSize;
        const res = await fetch(`${API_BASE_URL}/job-listings?companyId=${companyId}&$limit=${pageSize}&$skip=${skip}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const items = Array.isArray(data) ? data : (data?.data || []);
        const t = data?.total ?? items.length;
        if (!aborted) { setJobs(items); setTotal(t); }
      } catch (e) {
        if (!aborted) { setJobs([]); setTotal(0); }
      } finally {
        if (!aborted) setJobsLoading(false);
      }
    }
    fetchJobs();
    return () => { aborted = true; };
  }, [companyId, page]);

  const draftJobs = jobs.filter(j => j.status === 0);
  const pendingJobs = jobs.filter(j => j.status === 1);
  const activeJobs = jobs.filter(j => j.status === 2);
  const pastJobs = jobs.filter(j => j.status === 3);

  const renderJobs = (list) => (
    jobsView === "grid" ? (
      <Row gutter={[16,16]}>
        {list.map(j => (
          <Col xs={24} sm={12} md={8} lg={6} key={j._id}>
            <JobCard job={j} companyView />
          </Col>
        ))}
      </Row>
    ) : (
      <Row gutter={[16,16]}>
        {list.map(j => (
          <Col xs={24} key={j._id}>
            <JobCard job={j} companyView />
          </Col>
        ))}
      </Row>
    )
  );

  return (
    <Card
      title="Job listings"
      extra={
        <Space size={8}>
          <Segmented
            size="small"
            options={[{ label: "List", value: "list" }, { label: "Grid", value: "grid" }]}
            value={jobsView}
            onChange={(val) => setJobsView(val)}
          />
          {companyId && (
            <>
              <Link href={`/companies/${companyId}`}>
                <Button type="link" size="small">View all</Button>
              </Link>
              <Link href="/company/jobs/new">
                <Button type="primary" size="small">Create job listing</Button>
              </Link>
            </>
          )}
        </Space>
      }
    >
      {jobsLoading ? (
        <Skeleton active />
      ) : jobs.length ? (
        <>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              { key: 'draft', label: `Draft (${draftJobs.length})`, children: renderJobs(draftJobs) },
              { key: 'pending', label: `Pending (${pendingJobs.length})`, children: renderJobs(pendingJobs) },
              { key: 'active', label: `Active (${activeJobs.length})`, children: renderJobs(activeJobs) },
              { key: 'past', label: `Past (${pastJobs.length})`, children: renderJobs(pastJobs) },
            ]}
          />
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
            <Pagination current={page} pageSize={pageSize} total={total} showSizeChanger={false} onChange={(p)=> setPage(p)} />
          </div>
        </>
      ) : (
        <Empty description="No jobs yet" />
      )}
    </Card>
  );
}

