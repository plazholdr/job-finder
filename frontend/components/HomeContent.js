"use client";
import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Hero from "./Hero";
import JobCard from "./JobCard";
import CompanyCard from "./CompanyCard";
import InternCard from "./InternCard";
import { Layout, Row, Col, Typography, Skeleton, Empty, Input, Space, Select, InputNumber, DatePicker, Button, message, Segmented } from "antd";
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
  const [salaryMin, setSalaryMin] = useState(0);
  const [salaryMax, setSalaryMax] = useState(5000);
  const [sort, setSort] = useState('latest');
  const [prefApplied, setPrefApplied] = useState(false);

  // View modes
  const [jobsView, setJobsView] = useState('list');
  const [companiesView, setCompaniesView] = useState('list');
  // Role detection (student/company/admin)
  const [role, setRole] = useState('');
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    (async () => {
      try {
        const r = await fetch(`${API_BASE_URL}/users/me`, { headers: { Authorization: `Bearer ${token}` } });
        if (r.ok) {
          const me = await r.json();
          setRole(String(me?.role || '').toLowerCase());
        }
      } catch (_) {}
    })();
  }, []);

  // Company-facing intern search filters
  const [fos, setFos] = useState("");
  const [prefStart, setPrefStart] = useState();
  const [prefEnd, setPrefEnd] = useState();
  const [loc1, setLoc1] = useState("");
  const [loc2, setLoc2] = useState("");
  const [loc3, setLoc3] = useState("");
  const [internSalMin, setInternSalMin] = useState();
  const [internSalMax, setInternSalMax] = useState();
  const [internsView, setInternsView] = useState('list');

  const candidatesUrl = useMemo(() => {
    const qs = new URLSearchParams();
    if (fos) qs.set('faculty', fos);
    if (prefStart) qs.set('startDate', prefStart.toISOString());
    if (prefEnd) qs.set('endDate', prefEnd.toISOString());
    [loc1, loc2, loc3].filter(Boolean).forEach(l => qs.append('locations', l));
    if (internSalMin != null) qs.set('salaryMin', String(internSalMin));
    if (internSalMax != null) qs.set('salaryMax', String(internSalMax));
    return `${API_BASE_URL}/programme-candidates?${qs.toString()}`;
  }, [fos, prefStart, prefEnd, loc1, loc2, loc3, internSalMin, internSalMax]);

  const internsQuery = useQuery({
    queryKey: ['home-interns', candidatesUrl, role],
    queryFn: async () => {
      const token = getToken();
      const res = await fetch(candidatesUrl, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) throw new Error('Candidates fetch failed');
      const data = await res.json();
      return data?.items || [];
    },
    enabled: role === 'company',
    initialData: [],
  });

  async function handleSaveCompanySearchProfile() {
    try {
      await apiAuth('/search-profiles', {
        method: 'POST',
        body: {
          kind: 'intern',
          filters: {
            fieldOfStudy: fos || undefined,
            preferredStartDate: prefStart ? prefStart.toISOString() : undefined,
            preferredEndDate: prefEnd ? prefEnd.toISOString() : undefined,
            locations: [loc1, loc2, loc3].filter(Boolean),
            salaryRange: { min: internSalMin, max: internSalMax }
          }
        }
      });
      message.success('Intern search profile saved');
    } catch (e) {
      message.error(e.message || 'Failed to save search profile');
    }
  }

  // Student company search profile
  const [studentPrefApplied, setStudentPrefApplied] = useState(false);
  const studentSearchProfileQuery = useQuery({
    queryKey: ['student-search-profile-company', role],
    queryFn: async () => {
      const token = getToken();
      if (!token) return null;
      const res = await fetch(`${API_BASE_URL}/search-profiles?kind=company`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return null;
      const data = await res.json();
      const items = data?.items || data?.data || [];
      return items[0] || null;
    },
    enabled: role === 'student',
    staleTime: 60_000,
  });

  useEffect(() => {
    if (role !== 'student') return;
    if (studentPrefApplied) return;
    const filters = studentSearchProfileQuery.data?.filters;
    if (!filters) return;
    if (filters.keyword != null) setQ(filters.keyword);
    if (filters.nature != null) setNature(filters.nature);
    if (filters.location != null) setCompanyCity(filters.location);
    if (filters.salaryRange) {
      setSalaryMin(filters.salaryRange.min ?? 0);
      setSalaryMax(filters.salaryRange.max ?? 5000);
    }
    if (filters.sort) setSort(filters.sort);
    setStudentPrefApplied(true);
  }, [role, studentPrefApplied, studentSearchProfileQuery.data]);


  const jobsUrl = useMemo(() => buildQuery("/job-listings", { q, location, salaryMin, salaryMax }), [q, location, salaryMin, salaryMax]);
  const companiesUrl = useMemo(() => buildQuery("/companies", { q, nature, city: companyCity, salaryMin, salaryMax, sort }), [q, nature, companyCity, salaryMin, salaryMax, sort]);

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
        setSalaryMin(prefs.salaryRange.min ?? 0);
        setSalaryMax(prefs.salaryRange.max ?? 5000);
      }
      setPrefApplied(true);
    }
  }, [profileQuery.data, prefApplied]);


  async function handleSaveSearchProfile() {
    try {
      await apiAuth('/search-profiles', {
        method: 'POST',
        body: {
          kind: 'company',
          filters: {
            keyword: q || undefined,
            nature: nature || undefined,
            location: companyCity || undefined,
            salaryRange: { min: salaryMin, max: salaryMax },
            sort
          }
        }
      });
      message.success('Search profile saved');
    } catch (e) {
      if (e.message?.includes('Not authenticated')) message.warning('Sign in to save your search profile');
      else message.error('Failed to save search profile');
    }
  }


  return (
    <Layout>
      <Navbar />
      <Hero onSearch={({ q: qq = "" }) => { setQ(qq); }} industryOptions={industriesQuery.data || []} />
      <Layout.Content style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
        {role === 'company' ? (
          <>
            <Space direction="vertical" style={{ width: '100%', marginBottom: 24 }} size="middle">
              <Row gutter={[16,16]} align="middle">
                <Col xs={24} md={8}>
                  <Typography.Text strong>Intern field of study</Typography.Text>
                  <Input placeholder="e.g., Computer Science" value={fos} onChange={(e)=>setFos(e.target.value)} />
                </Col>
                <Col xs={24} md={8}>
                  <Typography.Text strong>Internship dates</Typography.Text>
                  <Space style={{ width: '100%' }}>
                    <DatePicker placeholder="Start on/after" value={prefStart} onChange={setPrefStart} />
                    <DatePicker placeholder="End on/before" value={prefEnd} onChange={setPrefEnd} />
                  </Space>
                </Col>
                <Col xs={24} md={8}>
                  <Typography.Text strong>Preferred locations</Typography.Text>
                  <Space style={{ width: '100%' }}>
                    <Input placeholder="City/State 1" value={loc1} onChange={(e)=>setLoc1(e.target.value)} />
                    <Input placeholder="City/State 2" value={loc2} onChange={(e)=>setLoc2(e.target.value)} />
                    <Input placeholder="City/State 3" value={loc3} onChange={(e)=>setLoc3(e.target.value)} />
                  </Space>
                </Col>
                <Col xs={24} md={8}>
                  <Typography.Text strong>Salary range (RM)</Typography.Text>
                  <Space>
                    <InputNumber placeholder="Min" min={0} value={internSalMin} onChange={setInternSalMin} />
                    <InputNumber placeholder="Max" min={0} value={internSalMax} onChange={setInternSalMax} />
                  </Space>
                </Col>
                <Col xs={24} md={4}>
                  <Button type="primary" onClick={handleSaveCompanySearchProfile} style={{ marginTop: 22 }}>Save search profile</Button>
                </Col>
              </Row>
            </Space>

            <section id="interns" style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Typography.Title level={3} style={{ margin: 0 }}>Interns</Typography.Title>
                <Segmented value={internsView} onChange={setInternsView} options={[{label:'List',value:'list'},{label:'Grid',value:'grid'}]} />
              </div>
              {internsQuery.isLoading ? (
                <Skeleton active />
              ) : internsQuery.data?.length ? (
                <Row gutter={[16,16]}>
                  {internsQuery.data.map((u) => (
                    <Col xs={24} sm={internsView==='grid'?12:24} md={internsView==='grid'?8:24} lg={internsView==='grid'?6:24} key={u._id || u.id}>
                      <InternCard intern={u} />
                    </Col>
                  ))}
                </Row>
              ) : (
                <Empty description="No interns found" />
              )}
            </section>
          </>
        ) : (
          <>
            <Space direction="vertical" style={{ width: '100%', marginBottom: 24 }} size="middle">
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={12} md={6}>
                  <Typography.Text strong>Nature of business</Typography.Text>
                  <Select
                    placeholder="Select industry"
                    value={nature}
                    onChange={setNature}
                    style={{ width: '100%', marginTop: 4 }}
                    allowClear
                    options={industriesQuery.data?.map(industry => ({
                      value: industry,
                      label: industry
                    })) || []}
                  />
                </Col>
                <Col xs={12} sm={6} md={3}>
                  <Typography.Text strong>Salary Min (RM)</Typography.Text>
                  <InputNumber
                    placeholder="Min"
                    value={salaryMin}
                    onChange={setSalaryMin}
                    style={{ width: '100%', marginTop: 4 }}
                    min={0}
                    max={50000}
                    step={500}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  />
                </Col>
                <Col xs={12} sm={6} md={3}>
                  <Typography.Text strong>Salary Max (RM)</Typography.Text>
                  <InputNumber
                    placeholder="Max"
                    value={salaryMax}
                    onChange={setSalaryMax}
                    style={{ width: '100%', marginTop: 4 }}
                    min={0}
                    max={50000}
                    step={500}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Typography.Text strong>Location</Typography.Text>
                  <Select
                    placeholder="Select location"
                    value={companyCity}
                    onChange={setCompanyCity}
                    style={{ width: '100%', marginTop: 4 }}
                    allowClear
                    options={[
                      { value: 'Kuala Lumpur', label: 'Kuala Lumpur' },
                      { value: 'Selangor', label: 'Selangor' },
                      { value: 'Penang', label: 'Penang' },
                      { value: 'Johor', label: 'Johor' },
                      { value: 'Perak', label: 'Perak' },
                      { value: 'Sabah', label: 'Sabah' },
                      { value: 'Sarawak', label: 'Sarawak' },
                    ]}
                  />
                </Col>
                <Col xs={24} sm={12} md={4}>
                  <Typography.Text strong>Sort by</Typography.Text>
                  <Select
                    value={sort}
                    onChange={setSort}
                    style={{ width: '100%', marginTop: 4 }}
                    options={[
                      { value: 'latest', label: 'Latest' },
                      { value: 'name', label: 'A→Z' },
                      { value: 'salary', label: 'Salary ↓' },
                    ]}
                  />
                </Col>
                <Col xs={24} sm={12} md={2}>
                  <Button
                    type="primary"
                    onClick={handleSaveSearchProfile}
                    style={{ width: '100%', marginTop: 20 }}
                  >
                    Save Profile
                  </Button>
                </Col>
              </Row>
            </Space>
            <section id="jobs" style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Typography.Title level={3} style={{ margin: 0 }}>Latest Jobs</Typography.Title>
                <Segmented value={jobsView} onChange={setJobsView} options={[{label:'List',value:'list'},{label:'Grid',value:'grid'}]} />
              </div>
              {jobsQuery.isLoading ? (
                <Skeleton active />
              ) : jobsQuery.data?.length ? (
                <Row gutter={[16, 16]}>
                  {jobsQuery.data.map((j) => (
                    <Col xs={24} sm={jobsView==='grid'?12:24} md={jobsView==='grid'?8:24} lg={jobsView==='grid'?6:24} key={j._id}>
                      <JobCard job={j} />
                    </Col>
                  ))}
                </Row>
              ) : (
                <Empty description="No jobs found" />
              )}
            </section>
            <section id="companies" style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Typography.Title level={3} style={{ margin: 0 }}>Featured Companies</Typography.Title>
                <Segmented value={companiesView} onChange={setCompaniesView} options={[{label:'List',value:'list'},{label:'Grid',value:'grid'}]} />
              </div>
              {companiesQuery.isLoading ? (
                <Skeleton active />
              ) : companiesQuery.data?.length ? (
                <Row gutter={[16, 16]}>
                  {companiesQuery.data.map((c) => (
                    <Col xs={24} sm={companiesView==='grid'?12:24} md={companiesView==='grid'?8:24} lg={companiesView==='grid'?6:24} key={c._id}>
                      <CompanyCard company={c} />
                    </Col>
                  ))}
                </Row>
              ) : (
                <Empty description="No companies found" />
              )}
            </section>
          </>
        )}

      </Layout.Content>
      <Footer />
    </Layout>
  );
}
