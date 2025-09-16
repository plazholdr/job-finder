"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import AppHeader from "@/components/layout/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import config from "@/config";
import { Eye, Users, Edit, Trash2, Send, ArrowLeft, XCircle, Copy } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";

export default function CompanyJobDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const jobId = params?.id as string;

  const [picOpen, setPicOpen] = useState(false);
  const [perJobOnly, setPerJobOnly] = useState(false);
  const [pic, setPic] = useState<{ name: string; email: string; phone: string; title: string }>({ name: "", email: "", phone: "", title: "" });
  const [isSavingPic, setIsSavingPic] = useState(false);
  const [companyProfile, setCompanyProfile] = useState<any | null>(null);

  const loadProfile = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
      if (!token) return;
      const resp = await fetch(`${config.api.baseUrl}/users/profile`, { headers: { Authorization: `Bearer ${token}` } });
      const payload = await resp.json().catch(() => ({}));
      setCompanyProfile(payload?.data ?? payload ?? null);
    } catch (e) {
      console.error("Failed to load profile", e);
    }
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openEditPic = () => {
    const fallback = companyProfile?.company?.contactPerson || {};
    const current = job?.contactPerson || fallback || {};
    setPic({ name: current.name || "", email: current.email || "", phone: current.phone || "", title: current.title || "" });
    setPerJobOnly(false);
    setPicOpen(true);
  };

  const handleSavePic = async () => {
    try {
      setIsSavingPic(true);
      const token = localStorage.getItem("authToken");
      const url = perJobOnly ? `/api/jobs/${jobId}/pic` : `/api/company/pic`;
      const resp = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(pic),
      });
      const payload = await resp.json().catch(() => ({}));
      if (resp.ok) {
        await loadJob();
        if (!perJobOnly) await loadProfile();
        setPicOpen(false);
        toast({
          title: "PIC updated",
          description: perJobOnly ? "Applied to this job only." : "Updated company default PIC.",
        });
      } else {
        toast({
          title: "Update failed",
          description: payload?.error || "Could not update PIC.",
        });
      }
    } catch (e: any) {
      console.error("Failed to save PIC", e);
      toast({ title: "Update failed", description: e?.message || "Could not update PIC." });
    } finally {
      setIsSavingPic(false);
    }
  };
  const [job, setJob] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [isClosing, setIsClosing] = useState(false);

  const loadJob = async () => {
    try {
      setLoading(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
      const resp = await fetch(`${config.api.baseUrl}/jobs/${jobId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const payload = await resp.json().catch(() => ({}));
      const data = payload?.data ?? payload;
      setJob(data || null);
    } catch (e) {
      console.error("Failed to load job", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jobId) loadJob();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const requestApproval = async () => {
    try {
      setSubmitting(true);
      const token = localStorage.getItem("authToken");
      await fetch(`${config.api.baseUrl}/jobs/${jobId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: "Pending" }),
      });
      await loadJob();
    } catch (e) {
      console.error("Failed to request approval", e);
    } finally {
      setSubmitting(false);
    }
  };

  const amendAndEdit = async () => {
    try {
      setSubmitting(true);
      const token = localStorage.getItem("authToken");
      await fetch(`${config.api.baseUrl}/jobs/${jobId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: "Draft" }),
      });
      router.push(`/company/jobs/${jobId}/edit`);
    } catch (e) {
      console.error("Failed to amend job", e);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteJob = async () => {
    if (!confirm("Delete this job? This action cannot be undone.")) return;
    try {
      setSubmitting(true);
      const token = localStorage.getItem("authToken");
      await fetch(`${config.api.baseUrl}/jobs/${jobId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      router.push("/company/jobs");
    } catch (e) {
      console.error("Failed to delete job", e);
    } finally {
      setSubmitting(false);
    }
  };

  const closeJob = async () => {
    if (!confirm("Close this job? This will remove it from the job portal.")) return;
    try {
      setIsClosing(true);
      const token = localStorage.getItem("authToken");
      const resp = await fetch(`${config.api.baseUrl}/jobs/${jobId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: "Closed", reason: "Closed by company" }),
      });
      const payload = await resp.json().catch(() => ({}));
      if (resp.ok) {
        await loadJob();
        toast({ title: "Job closed", description: "The listing has been removed from the portal." });
      } else {
        toast({ title: "Close failed", description: payload?.error || "Could not close job." });
      }
    } catch (e: any) {
      console.error("Failed to close job", e);
      toast({ title: "Close failed", description: e?.message || "Could not close job." });
    } finally {
      setIsClosing(false);
    }
  };

  const duplicateJob = async () => {
    if (!confirm("Create a copy of this job as a new Draft?")) return;
    try {
      const token = localStorage.getItem("authToken");
      const resp = await fetch(`${config.api.baseUrl}/jobs/${jobId}/duplicate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await resp.json().catch(() => ({}));
      if (resp.ok && payload?.data?._id) {
        toast({ title: "Job copied", description: "A new draft has been created." });
        router.push(`/company/jobs/${payload.data._id}/edit`);
      } else {
        toast({ title: "Copy failed", description: payload?.error || "Could not duplicate job." });
      }
    } catch (e: any) {
      console.error("Failed to duplicate job", e);
      toast({ title: "Copy failed", description: e?.message || "Could not duplicate job." });
    }
  };

  const statusColor = (status?: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Draft":
        return "bg-gray-100 text-gray-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      case "Closed":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50">

        <AppHeader />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <Card>
            <CardContent className="p-10 text-center text-gray-600">Job not found.</CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const id = job?._id || job?.id || jobId;
  const views = job?.views ?? job?.viewsCount ?? 0;
  const applications = job?.applications ?? job?.applicationsCount ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <Button variant="ghost" onClick={() => router.back()} className="mb-2">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Jobs
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">{job.title || "Untitled job"}</h1>
            <div className="mt-2 flex items-center gap-3 text-sm text-gray-600">
              <Badge className={statusColor(job.status)}>{job.status || "Draft"}</Badge>
              <span className="flex items-center"><Eye className="h-4 w-4 mr-1" /> {views} views</span>
              <span className="flex items-center"><Users className="h-4 w-4 mr-1" /> {applications} applications</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {job.status !== "Closed" && (
              <Link href={`/jobs/${id}`}><Button variant="outline" size="sm">View public</Button></Link>
            )}
            {job.status === "Active" && (
              <>
                <Link href={`/company/jobs/${id}/applications`}><Button variant="outline" size="sm"><Users className="h-4 w-4 mr-2" />Applications</Button></Link>
                <Button onClick={closeJob} disabled={isClosing} variant="destructive" size="sm"><XCircle className="h-4 w-4 mr-2" />{isClosing ? "Closing..." : "Close"}</Button>
              </>
            )}
            {job.status === "Draft" && (
              <Link href={`/company/jobs/${id}/edit`}><Button variant="outline" size="sm"><Edit className="h-4 w-4 mr-2" />Edit</Button></Link>
            )}
            {job.status === "Closed" && (
              <Button onClick={duplicateJob} variant="outline" size="sm"><Copy className="h-4 w-4 mr-2" />Duplicate</Button>
            )}
            {job.status === "Draft" && (
              <Button onClick={requestApproval} disabled={submitting} size="sm" className="bg-blue-600 text-white">
                {submitting ? "Submitting..." : (<><Send className="h-4 w-4 mr-2" />Request Approval</>)}
              </Button>
            )}
            {job.status === "Rejected" && (
              <Button onClick={amendAndEdit} disabled={submitting} size="sm" className="bg-orange-600 text-white">
                <Edit className="h-4 w-4 mr-2" />Amend & Edit
              </Button>
            )}

            {job.status === "Draft" && (
              <Button onClick={deleteJob} variant="destructive" size="sm"><Trash2 className="h-4 w-4 mr-2" />Delete</Button>
            )}
          </div>
        </div>


            {job.status === "Pending" && (
              <Button onClick={openEditPic} size="sm" className="bg-green-600 text-white">Edit PIC</Button>
            )}
        {job.status === "Rejected" && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800">This job was rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-red-800">
                Reason: {job.rejectionReason || 'Not specified'}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-gray-500">Location</div>
                <div className="text-gray-900">{job?.remoteWork ? "Remote" : (job?.location || "Not specified")}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Salary</div>
                <div className="text-gray-900">
                  {job?.salary?.minimum != null && job?.salary?.maximum != null
                    ? `${job?.salary?.currency || "MYR"} ${job.salary.minimum}-${job.salary.maximum}/${job?.salary?.type || "month"}`
                    : "Not specified"}
                </div>
              </div>
              {job?.duration?.months != null && (
                <div>
                  <div className="text-sm text-gray-500">Duration</div>
                  <div className="text-gray-900">{job.duration.months} months</div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-gray-800">{job.description || "—"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-gray-800">{job.requirements || "—"}</p>
            </CardContent>
          </Card>

          {/* Project Details */}
          <Card>
            <CardHeader>
              <CardTitle>Project details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-gray-800">
              <div>
                <div className="text-sm text-gray-500">Project title</div>
                <div>{job?.project?.title || "—"}</div>
              </div>
              {job?.project?.description && (
                <div>
                  <div className="text-sm text-gray-500">Project description</div>
                  <p className="whitespace-pre-wrap">{job.project.description}</p>
                </div>
              )}
              {(job?.project?.startDate || job?.project?.endDate) && (
                <div className="flex gap-6">
                  <div>
                    <div className="text-sm text-gray-500">Start</div>
                    <div>{job?.project?.startDate ? new Date(job.project.startDate).toLocaleDateString() : "—"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">End</div>
                    <div>{job?.project?.endDate ? new Date(job.project.endDate).toLocaleDateString() : "—"}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Onboarding Materials (attachments) */}
          <Card>
            <CardHeader>
              <CardTitle>Onboarding materials</CardTitle>
            </CardHeader>
            <CardContent>
              {Array.isArray(job?.attachments) && job.attachments.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1">
                  {job.attachments.map((att: any, idx: number) => {
                    const name = att.originalName || att.name || `Attachment ${idx + 1}`;
                    const href = att.publicUrl || att.url || null;
                    return (
                      <li key={att._id || idx}>
                        {href ? (
                          <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{name}</a>
                        ) : (
                          <span>{name}</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="text-gray-600">No materials uploaded</div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Edit PIC Dialog */}
        <Dialog open={picOpen} onOpenChange={setPicOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit PIC (Person-in-Charge)</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pic-name">Name</Label>
                  <Input id="pic-name" value={pic.name} onChange={(e) => setPic({ ...pic, name: e.target.value })} placeholder="Full name" />
                </div>
                <div>
                  <Label htmlFor="pic-title">Title</Label>
                  <Input id="pic-title" value={pic.title} onChange={(e) => setPic({ ...pic, title: e.target.value })} placeholder="Job title" />
                </div>
                <div>
                  <Label htmlFor="pic-email">Email</Label>
                  <Input id="pic-email" type="email" value={pic.email} onChange={(e) => setPic({ ...pic, email: e.target.value })} placeholder="name@company.com" />
                </div>
                <div>
                  <Label htmlFor="pic-phone">Phone</Label>
                  <Input id="pic-phone" value={pic.phone} onChange={(e) => setPic({ ...pic, phone: e.target.value })} placeholder="e.g. +60 12-345 6789" />
                </div>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox id="perJob" checked={perJobOnly} onCheckedChange={(v) => setPerJobOnly(Boolean(v))} />
                <Label htmlFor="perJob">Apply to this job only (keep company default unchanged)</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPicOpen(false)} disabled={isSavingPic}>Cancel</Button>
              <Button onClick={handleSavePic} disabled={isSavingPic} className="bg-blue-600 text-white">{isSavingPic ? "Saving..." : "Save"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}

