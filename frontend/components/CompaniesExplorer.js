"use client";
import { useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Row, Col, Input, Select, Slider, Space, Typography, Pagination, Card, Skeleton, Empty, Segmented } from "antd";
import CompanyCard from "./CompanyCard";
import { API_BASE_URL } from "../config";

const SORT_OPTIONS = [
  { label: "Latest", value: "latest" },
  { label: "A → Z", value: "name" },
  { label: "Salary (High → Low)", value: "salary" },
];

const DEFAULT_SALARY = [0, 20000];

function buildCompaniesUrl({ q, industry, page, sort }) {
  const params = new URLSearchParams();
  params.set("$limit", "12");
  if (page && page > 1) params.set("$skip", String((page - 1) * 12));
  if (q) { params.set("name[$regex]", q); params.set("name[$options]", "i"); }
  if (industry) { params.set("industry[$regex]", industry); params.set("industry[$options]", "i"); }
  if (sort === "name") params.set("$sort[name]", "1");
  if (sort === "latest") params.set("$sort[createdAt]", "-1");
  return `${API_BASE_URL}/companies?${params.toString()}`;
}

export default function CompaniesExplorer() {
  const sp = useSearchParams();
  const router = useRouter();

  const [q, setQ] = useState(sp.get("q") || "");
  const [industry, setIndustry] = useState(sp.get("industry") || "");
  const [location, setLocation] = useState(sp.get("location") || "");
  const [salary, setSalary] = useState([
    Number(sp.get("minSalary")) || DEFAULT_SALARY[0],
    Number(sp.get("maxSalary")) || DEFAULT_SALARY[1],
  ]);
  const [sort, setSort] = useState(sp.get("sort") || "latest");
  const [page, setPage] = useState(Number(sp.get("page") || 1));

  // options for industry select (lightweight sampling)
  const industriesQuery = useQuery({
    queryKey: ["industries"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/companies?$limit=200&$select[]=industry`);
      const data = await res.json();
      const arr = Array.isArray(data) ? data : (data?.data || []);
      const uniq = Array.from(new Set(arr.map(x => x?.industry).filter(Boolean)));
      return uniq.sort();
    },
    staleTime: 5 * 60_000,
  });

  const needsJobsJoin = useMemo(() => {
    const [min, max] = salary;
    return !!location || sort === "salary" || min !== DEFAULT_SALARY[0] || max !== DEFAULT_SALARY[1];
  }, [location, salary, sort]);

  // Primary data query
  const [view, setView] = useState('list');

  const companiesQuery = useQuery({
    queryKey: ["companies-explorer", { q, industry, page, sort, salary, location }],
    queryFn: async () => {
      if (!needsJobsJoin) {
        const url = buildCompaniesUrl({ q, industry, page, sort });
        const res = await fetch(url);
        const data = await res.json();
        const items = Array.isArray(data) ? data : (data?.data || []);
        const total = data?.total ?? items.length;
        return { items, total };
      }
      // Step 1: get matching job-listings to derive company ids and salary stats
      const params = new URLSearchParams({ "$limit": "500" });
      if (location) {
        params.set("$or[0][location.city][$regex]", location);
        params.set("$or[0][location.city][$options]", "i");
        params.set("$or[1][location.state][$regex]", location);
        params.set("$or[1][location.state][$options]", "i");
      }
      if (salary?.[0] != null) params.set("salaryRange.min[$gte]", String(salary[0]));
      if (salary?.[1] != null) params.set("salaryRange.max[$lte]", String(salary[1]));
      const jobsRes = await fetch(`${API_BASE_URL}/job-listings?${params.toString()}`);
      const jobsJson = await jobsRes.json();
      const jobs = Array.isArray(jobsJson) ? jobsJson : (jobsJson?.data || []);
      const byCompany = new Map();
      for (const j of jobs) {
        const cid = j.companyId || j.company || j.company_id; // tolerate different shapes
        if (!cid) continue;
        const prev = byCompany.get(cid) || { count: 0, maxSalary: 0 };
        byCompany.set(cid, { count: prev.count + 1, maxSalary: Math.max(prev.maxSalary, Number(j?.salaryRange?.max) || 0) });
      }
      const ids = Array.from(byCompany.keys());
      if (!ids.length) return { items: [], total: 0 };
      // Step 2: fetch companies in ids with base q/industry filters
      const params2 = new URLSearchParams();
      params2.set("$limit", "12");
      if (page && page > 1) params2.set("$skip", String((page - 1) * 12));
      for (const id of ids) params2.append("_id[$in]", id);
      if (q) { params2.set("name[$regex]", q); params2.set("name[$options]", "i"); }
      if (industry) { params2.set("industry[$regex]", industry); params2.set("industry[$options]", "i"); }
      const res = await fetch(`${API_BASE_URL}/companies?${params2.toString()}`);
      const data = await res.json();
      let items = Array.isArray(data) ? data : (data?.data || []);
      const total = data?.total ?? items.length;
      if (sort === "salary") {
        items = [...items].sort((a,b)=> (byCompany.get(b._id)?.maxSalary||0) - (byCompany.get(a._id)?.maxSalary||0));
      } else if (sort === "name") {
        items = [...items].sort((a,b)=> String(a.name||"").localeCompare(String(b.name||"")));
      }
      return { items, total };
    },
    keepPreviousData: true,
  });

  // keep query string in sync
  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (industry) params.set("industry", industry);
    if (location) params.set("location", location);
    if (sort && sort !== "latest") params.set("sort", sort);
    if (page && page !== 1) params.set("page", String(page));
    if (salary) { params.set("minSalary", String(salary[0])); params.set("maxSalary", String(salary[1])); }
    const qs = params.toString();
    router.replace(`/companies${qs ? `?${qs}` : ""}`);
  }, [q, industry, location, sort, page, salary, router]);

  const data = companiesQuery.data || { items: [], total: 0 };

  return (
    <>
      <Card style={{ marginBottom: 16 }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space wrap style={{ justifyContent: 'space-between', width: '100%' }}>
            <Space wrap>
              <Input placeholder="Search company name" value={q} onChange={(e)=>{ setPage(1); setQ(e.target.value); }} style={{ width: 280 }} allowClear />
              <Select
                placeholder="Industry"
                value={industry || undefined}
                onChange={(v)=>{ setPage(1); setIndustry(v || ""); }}
                allowClear
                loading={industriesQuery.isLoading}
                style={{ minWidth: 220 }}
                options={(industriesQuery.data||[]).map(i=>({ label: i, value: i }))}
              />
              <Input placeholder="Location (jobs)" value={location} onChange={(e)=>{ setPage(1); setLocation(e.target.value); }} allowClear style={{ width: 220 }} />
              <Select value={sort} onChange={(v)=>{ setPage(1); setSort(v); }} options={SORT_OPTIONS} style={{ width: 200 }} />
            </Space>
            <Segmented value={view} onChange={setView} options={[{label:'List',value:'list'},{label:'Grid',value:'grid'}]} />
          </Space>
          <div>
            <Typography.Text type="secondary">Salary range (jobs): </Typography.Text>
            <div style={{ padding: '0 8px' }}>
              <Slider range min={0} max={20000} step={100} value={salary} onChange={(v)=>{ setPage(1); setSalary(v); }} tooltip={{ formatter: (v)=>`RM ${v}` }} />
            </div>
          </div>
        </Space>
      </Card>

      {companiesQuery.isLoading ? (
        <Skeleton active />
      ) : data.items.length ? (
        <>
          <Row gutter={[16,16]}>
            {data.items.map(c => (
              <Col xs={24} sm={view==='grid'?12:24} md={view==='grid'?8:24} lg={view==='grid'?6:24} key={c._id}>
                <CompanyCard company={c} />
              </Col>
            ))}
          </Row>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
            <Pagination current={page} pageSize={12} total={data.total} showSizeChanger={false}
              onChange={(p)=> setPage(p)} />
          </div>
        </>
      ) : (
        <Empty description="No companies found" />
      )}
    </>
  );
}

