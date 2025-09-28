"use client";
import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Hero from "./Hero";
import JobCard from "./JobCard";
import CompanyCard from "./CompanyCard";
import InternCard from "./InternCard";
import FilterBar from "./FilterBar";
import { getFilterConfig } from "./filterConfigs";
import { useFilters } from "../hooks/useFilters";
import { Layout, Row, Col, Typography, Skeleton, Empty, Space, Select, InputNumber, DatePicker, Button, message, Segmented } from "antd";
import Link from "next/link";
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

  // More options filter states
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  // Initialize filter configuration and state
  const filterConfig = getFilterConfig('intern-search');
  const {
    filters: selectedFilters,
    updateFilter: handleFilterChange,
    clearAllFilters: handleClearAllFilters,
    hasActiveFilters,
    toURLSearchParams
  } = useFilters({
    fieldOfStudy: [],
    educationLevel: [],
    university: [],
    workExperience: [],
    skills: [],
    preferredLocations: []
  });

  // Student filters for job and company search
  const {
    filters: studentFilters,
    updateFilter: handleStudentFilterChange,
    clearAllFilters: handleClearStudentFilters,
    hasActiveFilters: hasActiveStudentFilters
  } = useFilters({
    industry: [],
    jobType: [],
    experience: [],
    location: [],
    salary: []
  });

  // Build filtered URLs for student job and company search
  const filteredJobsUrl = useMemo(() => {
    if (typeof window === 'undefined') {
      return `${API_BASE_URL}/job-listings`;
    }

    const baseUrl = buildQuery(`${API_BASE_URL}/job-listings`, { q, location, salaryMin, salaryMax });
    const url = new URLSearchParams(baseUrl.split('?')[1] || '');
    const { industry, jobType, experience, location: filterLocation, salary } = studentFilters;

    if (industry?.length > 0) {
      industry.forEach(ind => url.append('industry', ind));
    }
    if (jobType?.length > 0) {
      jobType.forEach(type => url.append('jobType', type));
    }
    if (experience?.length > 0) {
      experience.forEach(exp => url.append('experience', exp));
    }
    if (filterLocation?.length > 0) {
      filterLocation.forEach(loc => url.append('location', loc));
    }
    if (salary?.length > 0) {
      salary.forEach(sal => {
        if (sal.includes('-')) {
          const [min, max] = sal.split('-').map(s => parseInt(s.trim()));
          if (min) url.set('salaryMin', String(min));
          if (max) url.set('salaryMax', String(max));
        }
      });
    }

    return `${API_BASE_URL}/job-listings?${url.toString()}`;
  }, [q, location, salaryMin, salaryMax, studentFilters]);

  const filteredCompaniesUrl = useMemo(() => {
    if (typeof window === 'undefined') {
      return `${API_BASE_URL}/companies`;
    }

    const baseUrl = buildQuery(`${API_BASE_URL}/companies`, { q, nature, city: companyCity, salaryMin, salaryMax, sort });
    const url = new URLSearchParams(baseUrl.split('?')[1] || '');
    const { industry, location: filterLocation } = studentFilters;

    if (industry?.length > 0) {
      industry.forEach(ind => url.append('industry', ind));
    }
    if (filterLocation?.length > 0) {
      filterLocation.forEach(loc => url.append('city', loc));
    }

    return `${API_BASE_URL}/companies?${url.toString()}`;
  }, [q, nature, companyCity, salaryMin, salaryMax, sort, studentFilters]);

  const candidatesUrl = useMemo(() => {
    const qs = new URLSearchParams();

    // Apply filter selections to API query based on actual data structure
    const {
      fieldOfStudy,
      educationLevel,
      university,
      workExperience,
      skills,
      preferredLocations
    } = selectedFilters;

    // Field of Study filter - maps to educations.fieldOfStudy
    if (fieldOfStudy?.length > 0) {
      fieldOfStudy.forEach(field => {
        qs.append('fieldOfStudy', field);
      });
    } else if (fos) {
      qs.set('fieldOfStudy', fos);
    }

    // Education Level filter - maps to educations.level
    if (educationLevel?.length > 0) {
      educationLevel.forEach(level => {
        qs.append('educationLevel', level);
      });
    }

    // University filter - maps to educations.institutionName
    if (university?.length > 0) {
      university.forEach(uni => {
        qs.append('university', uni);
      });
    }

    // Work Experience Industry filter - maps to workExperiences.industry
    if (workExperience?.length > 0) {
      workExperience.forEach(industry => {
        qs.append('workIndustry', industry);
      });
    }

    // Skills filter - maps to skills array
    if (skills?.length > 0) {
      skills.forEach(skill => {
        qs.append('skills', skill);
      });
    }

    // Preferred Locations filter - maps to preferences.locations
    if (preferredLocations?.length > 0) {
      preferredLocations.forEach(location => {
        qs.append('preferredLocation', location);
      });
    } else {
      // Fallback to legacy location inputs
      [loc1, loc2, loc3].filter(Boolean).forEach(l => qs.append('preferredLocation', l));
    }

    // Legacy date and salary filters (keep for backward compatibility)
    if (prefStart) {
      qs.set('startDate', prefStart.toISOString());
    }

    if (prefEnd) {
      qs.set('endDate', prefEnd.toISOString());
    }

    if (internSalMin != null) qs.set('salaryMin', String(internSalMin));
    if (internSalMax != null) qs.set('salaryMax', String(internSalMax));

    const finalUrl = `${API_BASE_URL}/programme-candidates?${qs.toString()}`;

    // Debug logging
    if (typeof window !== 'undefined') {
      console.log('🔍 Candidates URL:', finalUrl);
      console.log('📊 Filter selections:', selectedFilters);
      console.log('🗂️ Query params:', Object.fromEntries(qs.entries()));
    }

    return finalUrl;
  }, [fos, prefStart, prefEnd, loc1, loc2, loc3, internSalMin, internSalMax, selectedFilters]);

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
      const {
        fieldOfStudy,
        educationLevel,
        university,
        workExperience,
        skills,
        preferredLocations
      } = selectedFilters;

      await apiAuth('/users', {
        method: 'PATCH',
        body: {
          profile: {
            internSearchProfile: {
              // Save new filter structure
              fieldOfStudy: fieldOfStudy?.length > 0 ? fieldOfStudy : (fos ? [fos] : undefined),
              educationLevel: educationLevel?.length > 0 ? educationLevel : undefined,
              university: university?.length > 0 ? university : undefined,
              workExperience: workExperience?.length > 0 ? workExperience : undefined,
              skills: skills?.length > 0 ? skills : undefined,
              preferredLocations: preferredLocations?.length > 0 ? preferredLocations : [loc1, loc2, loc3].filter(Boolean),

              // Legacy fields for backward compatibility
              preferredStartDate: prefStart ? prefStart.toISOString() : undefined,
              preferredEndDate: prefEnd ? prefEnd.toISOString() : undefined,
              salaryRange: { min: internSalMin, max: internSalMax },

              // Save complete filter selections
              filterSelections: selectedFilters
            }
          }
        }
      });
      message.success('Intern search profile saved');
    } catch (e) {
      message.error(e.message || 'Failed to save search profile');
    }
  }

  async function handleSaveStudentSearchProfile() {
    try {
      const {
        fieldOfStudy,
        educationLevel,
        university,
        workExperience,
        skills,
        preferredLocations
      } = selectedFilters;

      await apiAuth('/users', {
        method: 'PATCH',
        body: {
          profile: {
            internSearchPreferences: {
              // Save student's search preferences for finding other interns/peers
              fieldOfStudy: fieldOfStudy?.length > 0 ? fieldOfStudy : (fos ? [fos] : undefined),
              educationLevel: educationLevel?.length > 0 ? educationLevel : undefined,
              university: university?.length > 0 ? university : undefined,
              workExperience: workExperience?.length > 0 ? workExperience : undefined,
              skills: skills?.length > 0 ? skills : undefined,
              preferredLocations: preferredLocations?.length > 0 ? preferredLocations : [loc1, loc2, loc3].filter(Boolean),

              // Legacy fields for backward compatibility
              preferredStartDate: prefStart ? prefStart.toISOString() : undefined,
              preferredEndDate: prefEnd ? prefEnd.toISOString() : undefined,
              salaryRange: { min: internSalMin, max: internSalMax },

              // Save complete filter selections
              filterSelections: selectedFilters
            }
          }
        }
      });
      message.success('Search preferences saved');
    } catch (e) {
      message.error(e.message || 'Failed to save search preferences');
    }
  }


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

  // Filtered queries for students
  const filteredJobsQuery = useQuery({
    queryKey: ["filtered-jobs", filteredJobsUrl, role],
    queryFn: async () => {
      const res = await fetch(filteredJobsUrl);
      if (!res.ok) throw new Error("Filtered jobs fetch failed");
      const data = await res.json();
      return Array.isArray(data) ? data : (data?.data || []);
    },
    enabled: role === 'student',
    initialData: jobs,
  });

  const filteredCompaniesQuery = useQuery({
    queryKey: ["filtered-companies", filteredCompaniesUrl, role],
    queryFn: async () => {
      const res = await fetch(filteredCompaniesUrl);
      if (!res.ok) throw new Error("Filtered companies fetch failed");
      const data = await res.json();
      return Array.isArray(data) ? data : (data?.data || []);
    },
    enabled: role === 'student',
    initialData: companies,
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

  // Load company search profile and apply filter preferences
  const companyProfileQuery = useQuery({
    queryKey: ["company-intern-profile"],
    queryFn: async () => {
      const token = getToken();
      if (!token) return null;
      const res = await fetch(`${API_BASE_URL}/users/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) return null;
      const user = await res.json();
      return user?.profile?.internSearchProfile || null;
    },
    enabled: typeof window !== 'undefined' && role === 'company',
    staleTime: 60_000,
  });

  // Apply company filter preferences once
  useEffect(() => {
    const profile = companyProfileQuery.data;
    if (!prefApplied && profile && role === 'company') {
      // Apply saved filter selections using the new filter system
      if (profile.filterSelections) {
        // Update filters using the handleFilterChange function
        Object.entries(profile.filterSelections).forEach(([key, value]) => {
          if (value && (Array.isArray(value) ? value.length > 0 : true)) {
            handleFilterChange(key, value);
          }
        });
      }

      // Apply legacy preferences
      if (profile.fieldOfStudy) setFos(Array.isArray(profile.fieldOfStudy) ? profile.fieldOfStudy[0] : profile.fieldOfStudy);
      if (profile.locations?.length) {
        setLoc1(profile.locations[0] || '');
        setLoc2(profile.locations[1] || '');
        setLoc3(profile.locations[2] || '');
      }
      if (profile.salaryRange) {
        setInternSalMin(profile.salaryRange.min);
        setInternSalMax(profile.salaryRange.max);
      }
      setPrefApplied(true);
    }
  }, [companyProfileQuery.data, prefApplied, role, handleFilterChange]);

  // Apply student preferences once
  useEffect(() => {
    const prefs = profileQuery.data?.internProfile?.preferences;
    if (!prefApplied && prefs && role !== 'company') {
      if (prefs.industries?.length) setNature(prefs.industries[0]);
      if (prefs.locations?.length) setCompanyCity(prefs.locations[0]);
      if (prefs.salaryRange && (prefs.salaryRange.min != null || prefs.salaryRange.max != null)) {
        setSalaryMin(prefs.salaryRange.min ?? 0);
        setSalaryMax(prefs.salaryRange.max ?? 5000);
      }
      setPrefApplied(true);
    }
  }, [profileQuery.data, prefApplied, role]);


  async function handleSaveSearchProfile() {
    try {
      await apiAuth('/student/internship/me', {
        method: 'PATCH',
        body: {
          preferences: {
            industries: nature ? [nature] : [],
            locations: companyCity ? [companyCity] : [],
            salaryRange: { min: salaryMin, max: salaryMax }
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
      <Hero onSearch={({ q: qq = "" }) => { setQ(qq); }} industryOptions={industriesQuery.data || []} />
      <Layout.Content style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
        {role === 'company' ? (
          <>
            {/* Filter Bar for Companies - Intern Search */}
            <FilterBar
              filterConfig={filterConfig}
              selectedFilters={selectedFilters}
              onFilterChange={handleFilterChange}
              onClearAll={handleClearAllFilters}
              onSaveProfile={handleSaveCompanySearchProfile}
              showSaveProfile={true}
              showClearAll={true}
              theme={{
                activeColor: '#7d69ff',
                inactiveColor: '#f5f5f5',
                textColor: '#666',
                activeTextColor: '#fff'
              }}
            />

            <section id="interns" style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Typography.Title level={3} style={{ margin: 0 }}>Intern Candidates</Typography.Title>
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
                <Empty description="No intern candidates found" />
              )}
            </section>
          </>
        ) : role === 'student' ? (
          <>
            {/* Filter Bar for Students - Job and Company Search */}
            <FilterBar
              filterConfig={getFilterConfig('job-search')}
              selectedFilters={studentFilters}
              onFilterChange={handleStudentFilterChange}
              onClearAll={handleClearStudentFilters}
              onSaveProfile={handleSaveStudentSearchProfile}
              showSaveProfile={true}
              showClearAll={true}
              theme={{
                activeColor: '#7d69ff',
                inactiveColor: '#f5f5f5',
                textColor: '#666',
                activeTextColor: '#fff'
              }}
            />

            {/* Jobs Section */}
            <section id="jobs" style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Typography.Title level={3} style={{ margin: 0 }}>Featured Jobs</Typography.Title>
                <Link href="/jobs">
                  <Button type="link">View All Jobs →</Button>
                </Link>
              </div>
              {filteredJobsQuery.isLoading ? (
                <Skeleton active />
              ) : filteredJobsQuery.data?.length ? (
                <Row gutter={[16,16]}>
                  {filteredJobsQuery.data.slice(0, 6).map((job) => (
                    <Col xs={24} sm={12} md={8} key={job._id || job.id}>
                      <JobCard job={job} />
                    </Col>
                  ))}
                </Row>
              ) : (
                <Empty description="No jobs found" />
              )}
            </section>

            {/* Companies Section */}
            <section id="companies" style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Typography.Title level={3} style={{ margin: 0 }}>Featured Companies</Typography.Title>
                <Link href="/companies">
                  <Button type="link">View All Companies →</Button>
                </Link>
              </div>
              {filteredCompaniesQuery.isLoading ? (
                <Skeleton active />
              ) : filteredCompaniesQuery.data?.length ? (
                <Row gutter={[16,16]}>
                  {filteredCompaniesQuery.data.slice(0, 6).map((company) => (
                    <Col xs={24} sm={12} md={8} key={company._id || company.id}>
                      <CompanyCard company={company} />
                    </Col>
                  ))}
                </Row>
              ) : (
                <Empty description="No companies found" />
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

