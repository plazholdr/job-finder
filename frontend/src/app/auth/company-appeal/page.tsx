"use client";

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

function CompanyAppealInner() {
  const params = useSearchParams();
  const token = params.get('token') || '';
  const [validated, setValidated] = useState<{ email?: string; companyName?: string } | null>(null);
  const [message, setMessage] = useState('');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'validating' | 'submitting' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    const run = async () => {
      setStatus('validating');
      const res = await fetch(`/api/companies/appeal?token=${encodeURIComponent(token)}`);
      const data = await res.json();
      if (res.ok) {
        setValidated(data.data || {});
        setStatus('idle');
      } else {
        setError(data.error || 'Invalid token');
        setStatus('error');
      }
    };
    run();
  }, [token]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setStatus('submitting');
    setError(null);

    const formData = new FormData();
    formData.append('token', token);
    if (message) formData.append('message', message);
    if (documentFile) formData.append('document', documentFile);

    const res = await fetch('/api/companies/appeal', { method: 'POST', body: formData });
    const data = await res.json();
    if (res.ok) {
      setStatus('success');
    } else {
      setError(data.error || 'Failed to submit appeal');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Company Registration Appeal</CardTitle>
        </CardHeader>
        <CardContent>
          {!token && <p className="text-red-600">Missing appeal token.</p>}
          {status === 'validating' && <p>Validating token…</p>}
          {status === 'error' && <p className="text-red-600">{error}</p>}

          {status !== 'success' && validated && (
            <form className="space-y-4" onSubmit={onSubmit}>
              <div>
                <label className="block text-sm mb-1">Company</label>
                <Input value={validated.companyName || ''} disabled />
              </div>
              <div>
                <label className="block text-sm mb-1">Registered Email</label>
                <Input value={validated.email || ''} disabled />
              </div>
              <div>
                <label className="block text-sm mb-1">Appeal Message</label>
                <Textarea rows={5} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Explain your appeal and include updated information." />
              </div>
              <div>
                <label className="block text-sm mb-1">Supporting Document (optional)</label>
                <Input type="file" onChange={(e) => setDocumentFile(e.target.files?.[0] || null)} />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="submit" disabled={status==='submitting'}>
                  {status==='submitting' ? 'Submitting…' : 'Submit Appeal'}
                </Button>
              </div>
            </form>
          )}

          {status === 'success' && (
            <div>
              <p className="text-green-700">Your appeal has been submitted. We will re-review your registration and contact you by email.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function CompanyAppealPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
      <CompanyAppealInner />
    </Suspense>
  );
}
