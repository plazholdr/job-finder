"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AppHeader from "@/components/layout/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ArrowLeft } from "lucide-react";
import config from "@/config";

export default function JobApplicationsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const jobId = params?.id as string;

  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const TABS = [
    { label: 'New application', query: { statusCode: 0 } },
    { label: 'Short listed', query: { statusCode: 1 } },
    { label: 'Pending acceptance', query: { statusCode: 2 } },
    { label: 'Accepted', query: { statusCode: 3 } },
    { label: 'Rejected', query: { status: 'rejected' as const } },
  ];
  const [activeTab, setActiveTab] = useState(0);


  useEffect(() => {
    const loadApplications = async () => {
      try {
        setLoading(true);
        const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
        const qs = new URLSearchParams({ limit: "50", jobId });
        const tabQuery = TABS[activeTab]?.query || {} as any;
        Object.entries(tabQuery).forEach(([k, v]) => qs.append(k, String(v)));
        const resp = await fetch(`${config.api.baseUrl}/applications?${qs.toString()}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const payload = await resp.json().catch(() => ({}));
        const list = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
        setApplications(list);
      } catch (e) {
        console.error("Failed to load applications", e);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };
    if (jobId) loadApplications();
  }, [jobId, activeTab]);

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Button variant="ghost" onClick={() => router.back()} className="mb-2">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="h-6 w-6" /> Applications
            </h1>
            <p className="text-sm text-gray-600">Job ID: {jobId}</p>
          </div>
        </div>
        {/* Status tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {TABS.map((tab, i) => (
            <Button
              key={tab.label}
              variant={i === activeTab ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab(i)}
            >
              {tab.label}
            </Button>
          ))}
        </div>


        <Card>
          <CardHeader>
            <CardTitle>Applicants</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-10 text-center text-gray-600">Loading applications...</div>
            ) : applications.length === 0 ? (
              <div className="py-10 text-center text-gray-600">No applications yet.</div>
            ) : (
              <div className="divide-y">
                {applications.map((app) => (
                  <div key={app._id || app.id} className="py-4 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{app.candidate?.name || app.applicantName || "Unnamed"}</div>
                      <div className="text-sm text-gray-600">{app.candidate?.email || app.applicantEmail || ""}</div>
                      <div className="text-xs text-gray-500 mt-1">Status: {app.status || "submitted"}</div>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span>{app.submittedAt ? new Date(app.submittedAt).toLocaleString() : ""}</span>
                      <Link href={`/company/applications/${app._id || app.id}`}>
                        <Button size="sm" variant="outline">View</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

