"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Search, MapPin, Users, Eye, Grid3X3, List, SortAsc, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface RawCandidate {
  id?: string;
  _id?: string;
  personalInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  academicInfo?: {
    university?: string;
    degree?: string;
    major?: string;
    year?: string;
    gpa?: number;
  };
  internshipInfo?: {
    applicationDate?: string | Date;
    availability?: "full-time" | "part-time";
    workLocation?: "remote" | "on-site" | "hybrid";
  };
  createdAt?: string;
  updatedAt?: string;
}

interface CandidateItem {
  id: string;
  name: string;
  email: string;
  address: string;
  university: string;
  major: string;
  degree: string;
  year: string;
  gpa?: number;
  availability?: string;
  workLocation?: string;
  applicationDate?: string;
}

function normalizeCandidate(u: any): CandidateItem {
  // Accept both our mock intern shape and real user records with role='student'
  const id = (u._id || u.id || u.userId || "").toString();

  const pf = u.internship?.profile?.profileInformation || {};
  const firstName = u.firstName ?? pf.firstName;
  const lastName = u.lastName ?? pf.lastName;
  const name = [firstName, lastName].filter(Boolean).join(" ") || u.personalInfo?.name || "Candidate";

  const email = u.email ?? pf.email ?? u.personalInfo?.email ?? "";
  const address = u.profile?.location ?? pf.location ?? u.personalInfo?.address ?? "";

  const edu0 = (u.student?.education && u.student.education[0])
    || (u.internship?.profile?.educationBackground && u.internship.profile.educationBackground[0])
    || undefined;
  const university = edu0?.institution ?? edu0?.university ?? "";
  const degree = edu0?.degree ?? edu0?.qualification ?? "";
  const major = edu0?.major ?? "";
  const year = edu0?.year ?? edu0?.graduationYear ?? "";
  const gpa = edu0?.gpa ?? undefined;

  const hours = u.internship?.details?.availability?.hoursPerWeek;
  const availability = hours != null ? (hours >= 30 ? "full-time" : "part-time") : undefined;
  const wp = u.internship?.details?.workPreferences;
  const workLocation = wp?.remote ? "remote" : (wp?.hybrid ? "hybrid" : (wp?.onSite ? "on-site" : undefined));

  const applicationDate = (u.updatedAt || u.createdAt || u.internship?.internshipInfo?.applicationDate || u.internship?.profile?.updatedAt || u.internship?.profile?.createdAt)?.toString();

  return { id, name, email, address, university, degree, major, year, gpa, availability, workLocation, applicationDate };
}

interface CandidateFilters {
  search: string;
  availability: "" | "full-time" | "part-time";
  location: string;
  major: string;
  sortBy: "name" | "latest" | "gpa";
}

export default function CompanyInternSearch() {
  const [candidates, setCandidates] = useState<CandidateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<CandidateFilters>({
    search: "",
    availability: "",
    location: "",
    major: "",
    sortBy: "name",
  });
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  useEffect(() => {
    fetchCandidates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.major, filters.availability, filters.location]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      const authHeaders = token ? { Authorization: `Bearer ${token}` } : undefined;

      // Build common params
      const params = new URLSearchParams();
      params.append("role", "student");
      params.append("limit", "50");
      if (filters.search) { params.append("q", filters.search); }

      // 1) Try the dedicated search endpoint first
      let list: any[] = [];
      let res = await fetch(`/api/users/search?${params.toString()}`, { headers: authHeaders });
      if (res.ok) {
        const raw = await res.json().catch(() => ({}));
        list = Array.isArray(raw) ? raw : (raw.data ?? raw.results ?? raw.items ?? []);
      } else {
        // 2) Fallback to generic users listing (older backends)
        const fallParams = new URLSearchParams();
        fallParams.append("role", "student");
        fallParams.append("$limit", "50");
        res = await fetch(`/api/users?${fallParams.toString()}`, { headers: authHeaders });
        const raw = await res.json().catch(() => ({}));
        list = Array.isArray(raw) ? raw : (raw.data ?? raw.results ?? raw.items ?? []);
      }

      const normalized = list.map(normalizeCandidate);
      setCandidates(normalized);
    } catch (e) {
      console.error("Error fetching candidates", e);
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  const sortedCandidates = useMemo(() => {
    const term = filters.search.trim().toLowerCase();
    let data = candidates.filter((c) => {
      const matchesSearch =
        !term || [c.name, c.university, c.major, c.email].some((v) => (v || "").toLowerCase().includes(term));
      const matchesAvailability = !filters.availability || c.availability === filters.availability;
      const matchesLocation = !filters.location || (c.address || "").toLowerCase().includes(filters.location.toLowerCase());
      const matchesMajor = !filters.major || (c.major || "").toLowerCase() === filters.major.toLowerCase();
      return matchesSearch && matchesAvailability && matchesLocation && matchesMajor;
    });

    switch (filters.sortBy) {
      case "name":
        data.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "latest":
        data.sort(
          (a, b) => new Date(b.applicationDate || 0).getTime() - new Date(a.applicationDate || 0).getTime()
        );
        break;
      case "gpa":
        data.sort((a, b) => (b.gpa || 0) - (a.gpa || 0));
        break;
    }
    return data;
  }, [candidates, filters]);

  const handleFilterChange = (key: keyof CandidateFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const CandidateCard = ({ c }: { c: CandidateItem }) => (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white flex items-center justify-center font-bold">
              {c.name.charAt(0)}
            </div>
            <div>
              <CardTitle className="text-lg group-hover:text-green-600 transition-colors">{c.name}</CardTitle>
              <div className="mt-1 flex flex-wrap gap-2 text-sm text-gray-600">
                <span className="flex items-center gap-1"><GraduationCap className="h-4 w-4" />{c.university}{c.major ? ` • ${c.major}` : ""}</span>
                {c.gpa != null && <Badge variant="secondary">GPA {c.gpa}</Badge>}
              </div>
              <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{c.address}</span>
                {c.availability && <span className="capitalize">{c.availability}</span>}
                {c.workLocation && <span className="capitalize">{c.workLocation}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/profile/${c.id}`}>
              <Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-1" /> View Profile</Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const majors = useMemo(() => {
    const set = new Set<string>();
    candidates.forEach(c => { if (c.major) set.add(c.major); });
    return Array.from(set).sort();
  }, [candidates]);

  return (
    <div>
      {/* Hero-like search */}
      <section className="bg-gradient-to-br from-green-50 to-emerald-100 py-10 rounded-xl mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-6">Discover Excellent Intern Candidates</h2>
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search names, universities, majors..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white py-6 border-b border-gray-200 mb-6 rounded-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Major</label>
              <select
                value={filters.major}
                onChange={(e) => handleFilterChange("major", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">All Majors</option>
                {majors.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
              <select
                value={filters.availability}
                onChange={(e) => handleFilterChange("availability", e.target.value as any)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Any</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <Input
                placeholder="City, State, Country"
                value={filters.location}
                onChange={(e) => handleFilterChange("location", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <div className="relative">
                <SortAsc className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange("sortBy", e.target.value as any)}
                  className="w-full border border-gray-300 rounded-md pl-9 pr-8 py-2 appearance-none"
                >
                  <option value="name">Name</option>
                  <option value="latest">Latest</option>
                  <option value="gpa">GPA</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results header */}
      <section className="py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h3 className="text-xl font-bold text-gray-900">{sortedCandidates.length} Candidates Found</h3>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4 mr-2" /> List
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4 mr-2" /> Grid
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading candidates...</div>
          ) : sortedCandidates.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">No candidates found</h4>
              <p className="text-gray-600">Try adjusting your search or filters.</p>
            </div>
          ) : viewMode === "list" ? (
            <div className="space-y-4">
              {sortedCandidates.map(c => (
                <CandidateCard key={c.id} c={c} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedCandidates.map(c => (
                <CandidateCard key={c.id} c={c} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

