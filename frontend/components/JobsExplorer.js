"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Row, Col, Input, Select, Slider, Space, Typography, Pagination, Card, Skeleton, Empty } from "antd";
import JobCard from "./JobCard";
import { API_BASE_URL } from "../config";

const SORT_OPTIONS = [
  { label: "Latest", value: "latest" },
  { label: "A → Z", value: "name" },
  { label: "Salary (High → Low)", value: "salary" },
];

export default function JobsExplorer() {
  const sp = useSearchParams();
  const router = useRouter();

  const [q, setQ] = useState(sp.get("q") || "");
  const [location, setLocation] = useState(sp.get("location") || "");
  const [salary, setSalary] = useState([Number(sp.get("minSalary")) || 0, Number(sp.get("maxSalary")) || 20000]);
  const [sort, setSort] = useState(sp.get("sort") || "latest");
  const [page, setPage] = useState(Number(sp.get("page") || 1));

  const query = useQuery({
    queryKey: ["jobs-explorer", { q, location, salary, sort, page }],
    queryFn: async () => {
      const params = new URLSearchParams({ "$limit": "12" });
      if (page && page > 1) params.set("$skip", String((page - 1) * 12));
      if (q) { params.set("title[$regex]", q); params.set("title[$options]", "i"); }
      if (location) { params.set("locations[$elemMatch][$regex]", location); params.set("locations[$elemMatch][$options]", "i"); }
      if (salary?.[0] != null) params.set("salaryMin[$gte]", String(salary[0]));
      if (salary?.[1] != null) params.set("salaryMax[$lte]", String(salary[1]));
      if (sort === "latest") params.set("$sort[createdAt]", "-1");
      if (sort === "name") params.set("$sort[title]", "1");
      const res = await fetch(`${API_BASE_URL}/job-listings?${params.toString()}`);
      const data = await res.json();
      let items = Array.isArray(data) ? data : (data?.data || []);
      const total = data?.total ?? items.length;
      if (sort === "salary") items = [...items].sort((a,b)=> (b.salaryMax||0) - (a.salaryMax||0));
      return { items, total };
    },
    keepPreviousData: true,
  });

  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (location) params.set("location", location);
    if (sort && sort !== "latest") params.set("sort", sort);
    if (page && page !== 1) params.set("page", String(page));
    if (salary) { params.set("minSalary", String(salary[0])); params.set("maxSalary", String(salary[1])); }
    const qs = params.toString();
    router.replace(`/jobs${qs ? `?${qs}` : ""}`);
  }, [q, location, sort, page, salary, router]);

  const data = query.data || { items: [], total: 0 };

  return (
    <>
      <Card style={{ marginBottom: 16 }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space wrap>
            <Input placeholder="Search job title" value={q} onChange={(e)=>{ setPage(1); setQ(e.target.value); }} style={{ width: 280 }} allowClear />
            <Input placeholder="Location" value={location} onChange={(e)=>{ setPage(1); setLocation(e.target.value); }} allowClear style={{ width: 220 }} />
            <Select value={sort} onChange={(v)=>{ setPage(1); setSort(v); }} options={SORT_OPTIONS} style={{ width: 200 }} />
          </Space>
          <div>
            <Typography.Text type="secondary">Salary range: </Typography.Text>
            <div style={{ padding: '0 8px' }}>
              <Slider range min={0} max={20000} step={100} value={salary} onChange={(v)=>{ setPage(1); setSalary(v); }} tooltip={{ formatter: (v)=>`RM ${v}` }} />
            </div>
          </div>
        </Space>
      </Card>

      {query.isLoading ? (
        <Skeleton active />
      ) : data.items.length ? (
        <>
          <Row gutter={[16,16]}>
            {data.items.map(j => (
              <Col xs={24} sm={12} md={8} lg={6} key={j._id}>
                <JobCard job={j} />
              </Col>
            ))}
          </Row>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
            <Pagination current={page} pageSize={12} total={data.total} showSizeChanger={false} onChange={(p)=> setPage(p)} />
          </div>
        </>
      ) : (
        <Empty description="No jobs found" />
      )}
    </>
  );
}

