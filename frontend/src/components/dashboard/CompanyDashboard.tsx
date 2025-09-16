"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useAuth } from "@/contexts/auth-context";
import PublicHeaderAndHero from "@/components/layout/PublicHeaderAndHero";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";


import CompanyInternSearch from "@/components/dashboard/CompanyInternSearch";


import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Briefcase,
  FileText,
  Calendar,
  UserCheck,
  ArrowUpRight,
  Eye,
  MoreHorizontal,
  Edit,
  Settings,
  Building2,
  Users,
} from "lucide-react";

const CompanyEssentialsModal = dynamic(
  () => import("@/components/company/CompanyEssentialsModal"),
  { ssr: false }
);

export default function CompanyDashboard() {
  const { user } = useAuth();



  const [companyStats, setCompanyStats] = useState<any>({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    newApplications: 0,
    interviewsScheduled: 0,
    hiredCandidates: 0,
  });
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [loadingCompany, setLoadingCompany] = useState(true);
  const [showEssentials, setShowEssentials] = useState(false);

  const isCompanyApproved = !!(
    user?.role === "company" &&
    (user.company?.approvalStatusCode === 1 || user.company?.approvalStatus === "approved")
  );

  useEffect(() => {
    if (!user || user.role !== "company") return;

    const fetchCompany = async () => {
      try {
        setLoadingCompany(true);
        const token = localStorage.getItem("authToken");
        if (user?.company?.approvalStatusCode === 1 && !user?.company?.inputEssentials) {
          setShowEssentials(true);
        }

        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

        const [statsRes, jobsRes, appsRes] = await Promise.all([
          fetch("/api/applications/stats/company", { headers }),
          fetch("/api/jobs?$limit=5", { headers }),
          fetch("/api/applications?$limit=5", { headers }),
        ]);

        const statsData = await statsRes.json().catch(() => ({}));
        if (statsData?.success && statsData.data) {
          setCompanyStats(statsData.data);
        } else if (statsData && !statsData.error) {
          setCompanyStats(statsData);
        }

        const jobsData = await jobsRes.json().catch(() => []);
        const jobsArr = Array.isArray(jobsData?.data)
          ? jobsData.data
          : Array.isArray(jobsData)
          ? jobsData
          : [];
        setRecentJobs(jobsArr);

        const appsData = await appsRes.json().catch(() => []);
        const appsArr = Array.isArray(appsData?.data)
          ? appsData.data
          : Array.isArray(appsData)
          ? appsData
          : [];
        setRecentApplications(appsArr);
      } catch (e) {
        console.error("Error loading company dashboard:", e);
      } finally {
        setLoadingCompany(false);
      }
    };

    fetchCompany();
  }, [user]);

  const companyStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "closed":
        return "bg-red-100 text-red-800";
      case "submitted":
        return "bg-blue-100 text-blue-800";
      case "reviewing":
        return "bg-purple-100 text-purple-800";
      case "interview_scheduled":
        return "bg-indigo-100 text-indigo-800";
      case "offer_extended":
        return "bg-emerald-100 text-emerald-800";
      case "rejected":
        return "bg-gray-200 text-gray-700";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const companyStatusText = (status: string) => {
    switch (status) {
      case "submitted":
        return "New Application";
      case "reviewing":
        return "Reviewing";
      case "interview_scheduled":
        return "Interview Scheduled";
      case "offer_extended":
        return "Offer Extended";
      case "rejected":
        return "Rejected";
      default:
        return (status || "").replace("_", " ");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeaderAndHero />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isCompanyApproved && (
          <Alert className="mb-6 bg-yellow-50 border-yellow-200">
            <AlertDescription className="text-yellow-900">
              Your company account is pending approval. You can browse candidates and explore the platform, but actions
              like posting jobs, inviting interns, or managing applications are disabled until approval.
              <span className="ml-2 underline">
                <Link href="/auth/company-pending-approval">Learn more</Link>
              </span>
            </AlertDescription>
          </Alert>
        )}
        {/* Intern Search (available even if pending approval) */}
        <div className="mb-8">
          <CompanyInternSearch />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                  <p className="text-3xl font-bold text-gray-900">{companyStats.totalJobs}</p>
                  <p className="text-sm text-gray-500">{companyStats.activeJobs} active</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Applications</p>
                  <p className="text-3xl font-bold text-gray-900">{companyStats.totalApplications}</p>
                  <p className="text-sm text-green-600 flex items-center">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    {companyStats.newApplications} new
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Interviews</p>
                  <p className="text-3xl font-bold text-gray-900">{companyStats.interviewsScheduled}</p>
                  <p className="text-sm text-gray-500">scheduled</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Hired</p>
                  <p className="text-3xl font-bold text-gray-900">{companyStats.hiredCandidates}</p>
                  <p className="text-sm text-gray-500">this month</p>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Job Postings */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Job Postings</CardTitle>
              <Link href="/company/jobs">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentJobs.length > 0 ? (
                  recentJobs.map((job: any, idx: number) => (
                    <div
                      key={job._id || job.id || idx}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <Link href={`/jobs/${job._id || job.id || ''}`} className="flex-1 block">
                        <h3 className="font-medium text-gray-900">{job.title}</h3>
                        <p className="text-sm text-gray-600">
                          {job.department} • {job.type}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm text-gray-500 flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            {job.viewsCount} views
                          </span>
                          <span className="text-sm text-gray-500 flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {job.applicationsCount} applications
                          </span>
                        </div>
                      </Link>
                      <div className="flex items-center space-x-2">
                        <Badge className={companyStatusColor(job.status)}>{job.status}</Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <Link href={`/jobs/${job._id || job.id || ''}`}>
                              <DropdownMenuItem>View job</DropdownMenuItem>
                            </Link>
                            <Link href="/company/jobs">
                              <DropdownMenuItem>Manage in Jobs</DropdownMenuItem>
                            </Link>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                const url = `${window.location.origin}/jobs/${job._id || job.id || ''}`;
                                navigator.clipboard?.writeText(url);
                              }}
                            >
                              Copy job link
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No job postings yet</p>
                    {isCompanyApproved ? (
                      <Link href="/company/jobs/create">
                        <Button className="mt-2">Create Your First Job</Button>
                      </Link>
                    ) : (
                      <Button className="mt-2" variant="outline" disabled title="Awaiting approval">
                        Awaiting Approval
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Applications */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Applications</CardTitle>
              <Link href="/company/applications">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentApplications.length > 0 ? (
                  recentApplications.map((application: any, idx: number) => (
                    <div
                      key={application.id || idx}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{application.candidate?.name}</h3>
                        <p className="text-sm text-gray-600">{application.candidate?.email}</p>
                        <p className="text-sm text-blue-600 font-medium">
                          {application.jobTitle || "Unknown Position"}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Applied {application.submittedAt ? new Date(application.submittedAt).toLocaleDateString() : ""}
                        </p>
                      </div>
                      <Badge className={companyStatusColor(application.status)}>
                        {companyStatusText(application.status)}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No applications yet</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Applications will appear once candidates start applying
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Company Management */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" /> Company Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/company/profile">
                <Button className="w-full h-20 flex flex-col items-center justify-center bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 hover:from-blue-100 hover:to-blue-200 border-blue-200">
                  <Edit className="h-6 w-6 mb-2 text-blue-600" />
                  <span className="text-sm font-medium">Manage Profile</span>
                  <span className="text-xs text-blue-600/80">Edit company information</span>
                </Button>
              </Link>
              <Link href="/company/settings">
                <Button className="w-full h-20 flex flex-col items-center justify-center bg-gradient-to-r from-green-50 to-green-100 text-green-700 hover:from-green-100 hover:to-green-200 border-green-200">
                  <Settings className="h-6 w-6 mb-2 text-green-600" />
                  <span className="text-sm font-medium">Settings</span>
                  <span className="text-xs text-green-600/80">Account & preferences</span>
                </Button>
              </Link>
              <Link href="/company/verification">
                <Button className="w-full h-20 flex flex-col items-center justify-center bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 hover:from-purple-100 hover:to-purple-200 border-purple-200">
                  <UserCheck className="h-6 w-6 mb-2 text-purple-600" />
                  <span className="text-sm font-medium">Verification</span>
                  <span className="text-xs text-purple-600/80">Company verification status</span>
                </Button>
              </Link>
              <Link href="/companies">
                <Button className="w-full h-20 flex flex-col items-center justify-center bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 hover:from-orange-100 hover:to-orange-200 border-orange-200">
                  <Eye className="h-6 w-6 mb-2 text-orange-600" />
                  <span className="text-sm font-medium">View Public Profile</span>
                  <span className="text-xs text-orange-600/80">See how others see you</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Essentials modal */}
      <CompanyEssentialsModal open={showEssentials} onOpenChange={setShowEssentials} />
    </div>
  );
}

