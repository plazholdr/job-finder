"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AppHeader from "@/components/layout/AppHeader";
import JobCreationWizard from "@/components/jobs/JobCreationWizard";
import config from "@/config";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function EditCompanyJobPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const jobId = params?.id as string;

  const [initialData, setInitialData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadJob = async () => {
      try {
        setLoading(true);
        const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
        const resp = await fetch(`${config.api.baseUrl}/jobs/${jobId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const payload = await resp.json().catch(() => ({}));
        const data = payload?.data ?? payload;
        setInitialData(data || {});
      } catch (e) {
        console.error("Failed to load job for edit", e);
      } finally {
        setLoading(false);
      }
    };
    if (jobId) loadJob();
  }, [jobId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading job...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <JobCreationWizard
          isEditing
          jobId={jobId}
          initialData={initialData || {}}
          onComplete={() => router.push(`/company/jobs/${jobId}`)}
          onCancel={() => router.push(`/company/jobs/${jobId}`)}
          showHeader={false}
        />
      </div>
    </div>
  );
}

