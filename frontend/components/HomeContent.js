"use client";
import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Hero from "./Hero";
import JobCard from "./JobCard";
import CompanyCard from "./CompanyCard";
import { Layout, Row, Col, Typography, Skeleton, Empty, Input, Space, Select, Slider, Button, message } from "antd";
import { API_BASE_URL } from "../config";
import { apiAuth, getToken } from "../lib/api";

function buildQuery(base, { q, location, nature, city, salaryMin, salaryMax, sort }) {
  const isJobs = base.includes("job-listings");
  const params = new URLSearchParams({ "$limit": "8" });
  if (isJobs) {
    if (q) { params.append(`title[$regex]`, q); params.append(`title[$options]`, "i"); }
    if (location) { params.append(`location.city[$regex]`, location); params.append(`location.city[$options]`, "i"); }
  } else {
    if (q) params.append('q', q);
    if (nature) params.append('nature', nature);
    if (city) params.append('city', city);
  }
  if (isJobs && (salaryMin != null || salaryMax != null)) {
    if (salaryMin != null) params.append('salaryRange.min[$gte]', String(salaryMin));
    if (salaryMax != null) params.append('salaryRange.max[$lte]', String(salaryMax));
  }
  if (!isJobs && (salaryMin != null || salaryMax != null)) {
    if (salaryMin != null) params.append('salaryMin', String(salaryMin));
    if (salaryMax != null) params.append('salaryMax', String(salaryMax));
  }
  if (!isJobs && sort) {
    params.append('sort', sort);
  }
  return `${API_BASE_URL}${base}?${params.toString()}`;
}

export default function HomeContent({ jobs = [], companies = [] }) {
  const [q, setQ] = useState("");
  const [location, setLocation] = useState("");
  const [nature, setNature] = useState();
  const [companyCity, setCompanyCity] = useState("");
  const [salary, setSalary] = useState([0, 2000]);
  const [sort, setSort] = useState('latest');
  const [prefApplied, setPrefApplied] = useState(false);

  const jobsUrl = useMemo(() => buildQuery("/job-listings", { q, location, salaryMin: salary[0], salaryMax: salary[1] }), [q, location, salary]);
  const companiesUrl = useMemo(() => buildQuery("/companies", { q, nature, city: companyCity, salaryMin: salary[0], salaryMax: salary[1], sort }), [q, nature, companyCity, salary, sort]);

  const jobsQuery = useQuery({
    queryKey: ["home-jobs", jobsUrl],
    queryFn: async () => {
      const res = await fetch(jobsUrl);
      if (!res.ok) throw new Error("Jobs fetch failed");
      const data = await res.json();
      return Array.isArray(data) ? data : (data?.data || []);
    },
    initialData: jobs,
  });

  const companiesQuery = useQuery({
    queryKey: ["home-companies", companiesUrl],
    queryFn: async () => {
      const res = await fetch(companiesUrl);
      if (!res.ok) throw new Error("Companies fetch failed");
      const data = await res.json();
      return Array.isArray(data) ? data : (data?.data || []);
    },
    initialData: companies,
  });

  const industriesQuery = useQuery({
    queryKey: ["industries"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/companies?$select[]=industry&$limit=500`);
      if (!res.ok) throw new Error("Industries fetch failed");
      const raw = await res.json();
      const arr = Array.isArray(raw) ? raw : (raw?.data || []);
      const list = Array.from(new Set(arr.map((x) => x?.industry).filter(Boolean))).sort();
      return list;
    },
    initialData: [],
  });

  // Load student's saved search preferences (if signed in as student)
  const profileQuery = useQuery({
    queryKey: ["me-intern-profile"],
    queryFn: async () => {
      const token = getToken();
      if (!token) return null;
      const res = await fetch(`${API_BASE_URL}/student/internship/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: typeof window !== 'undefined',
    staleTime: 60_000,
  });

  // Apply preferences once
  useEffect(() => {
    const prefs = profileQuery.data?.internProfile?.preferences;
    if (!prefApplied && prefs) {
      if (prefs.industries?.length) setNature(prefs.industries[0]);
      if (prefs.locations?.length) setCompanyCity(prefs.locations[0]);
      if (prefs.salaryRange && (prefs.salaryRange.min != null || prefs.salaryRange.max != null)) {
        setSalary([
          prefs.salaryRange.min ?? 0,
          prefs.salaryRange.max ?? 2000,
        ]);
      }
      setPrefApplied(true);
    }
  }, [profileQuery.data, prefApplied]);


  async function handleSaveSearchProfile() {
    try {
      await apiAuth('/student/internship/me', {
        method: 'PATCH',
        body: {
          preferences: {
            industries: nature ? [nature] : [],
            locations: companyCity ? [companyCity] : [],
            salaryRange: { min: salary[0], max: salary[1] }
          }
        }
      });
      message.success('Search profile saved');
    } catch (e) {
      if (e.message?.includes('Not signed in')) message.warning('Sign in as a student to save your search profile');
      else message.error('Failed to save search profile');
    }
  }


  return (
    <Layout>
      <Navbar />
      <Hero onSearch={({ q: qq = "", nature: nat, city }) => { setQ(qq); setNature(nat); setCompanyCity(city || ""); }} industryOptions={industriesQuery.data || []} />
      <Layout.Content style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
        <Space direction="vertical" style={{ width: '100%', marginBottom: 24 }} size="middle">
          <Space wrap>
            <div style={{ width: 280 }}>
              <Typography.Text>Salary range (RM)</Typography.Text>
              <Slider range min={0} max={5000} step={100} value={salary} onChange={setSalary} />
            </div>
            <Select value={sort} onChange={setSort} style={{ width: 200 }} options={[
              { value: 'latest', label: 'Sort: Latest' },
              { value: 'name', label: 'Sort: Alphabetical (A→Z)' },
              { value: 'salary', label: 'Sort: Salary (High→Low)' },
            ]} />
            <Button onClick={handleSaveSearchProfile}>Save search profile</Button>
          </Space>
        </Space>
        <section id="jobs" style={{ marginBottom: 32 }}>
          <Typography.Title level={3} style={{ marginBottom: 16 }}>Latest Jobs</Typography.Title>
          {jobsQuery.isLoading ? (
            <Skeleton active />
          ) : jobsQuery.data?.length ? (
            <Row gutter={[16, 16]}>
              {jobsQuery.data.map((j) => (
                <Col xs={24} sm={12} md={8} lg={6} key={j._id}>
                  <JobCard job={j} />
                </Col>
              ))}
            </Row>
          ) : (
            <Empty description="No jobs found" />
          )}
        </section>
        <section id="companies" style={{ marginBottom: 32 }}>
          <Typography.Title level={3} style={{ marginBottom: 16 }}>Featured Companies</Typography.Title>
          {companiesQuery.isLoading ? (
            <Skeleton active />
          ) : companiesQuery.data?.length ? (
            <Row gutter={[16, 16]}>
              {companiesQuery.data.map((c) => (
                <Col xs={24} sm={12} md={8} lg={6} key={c._id}>
                  <CompanyCard company={c} />
                </Col>
              ))}
            </Row>
          ) : (
            <Empty description="No companies found" />
          )}
        </section>
      </Layout.Content>
      <Footer />
    </Layout>
  );
}

