"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import config from '@/config';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CompanyEssentialsModal({ open, onOpenChange }: Props) {
  const { user, token, updateUser } = useAuth();
  const [description, setDescription] = useState('');
  const [nature, setNature] = useState('');
  const [address, setAddress] = useState('');
  const [picName, setPicName] = useState('');
  const [picEmail, setPicEmail] = useState('');
  const [picMobile, setPicMobile] = useState('');
  const [website, setWebsite] = useState('');
  const [logo, setLogo] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCompanyApproved = useMemo(() => {
    if (user?.role !== 'company') return false;
    const c = user.company || {} as any;
    return c.approvalStatusCode === 1 || c.verificationStatusCode === 1 || c.verificationStatus === 'verified';
  }, [user]);

  useEffect(() => {
    if (open && user?.company) {
      setDescription(user.company.description || '');
      setNature(user.company.industry || '');
      setAddress(user.company.headquarters || '');
      setWebsite(user.company.website || '');
      setPicName(user.company.contactPerson?.name || '');
      setPicEmail(user.company.contactPerson?.email || '');
      setPicMobile(user.company.contactPerson?.phone || '');
    }
  }, [open, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('description', description);
      formData.append('nature', nature);
      formData.append('address', address);
      formData.append('picName', picName);
      formData.append('picEmail', picEmail);
      formData.append('picMobile', picMobile);
      if (website) formData.append('website', website);
      if (logo) formData.append('logo', logo);

  const res = await fetch(`${config.api.baseUrl}/companies/essentials`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        let message = 'Failed to save company essentials';
        try { const data = await res.json(); message = data.error || data.message || message; } catch {}
        throw new Error(message);
      }

      const data = await res.json();
      if (data?.data) {
        await updateUser(data.data);
      }
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isCompanyApproved) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl p-0 overflow-hidden rounded-2xl">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <h2 className="text-2xl font-bold">Complete your company essentials</h2>
          <p className="text-blue-100 mt-1">Provide key company details so candidates can learn about your organisation.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description">Company Description</Label>
              <Textarea id="description" className="min-h-[120px] border-2 rounded-xl focus-visible:ring-0 focus:border-blue-500" value={description} onChange={(e) => setDescription(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nature">Nature of Business</Label>
              <Input id="nature" className="h-11 border-2 rounded-xl focus-visible:ring-0 focus:border-blue-500" value={nature} onChange={(e) => setNature(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Headquarters / Address</Label>
              <Input id="address" className="h-11 border-2 rounded-xl focus-visible:ring-0 focus:border-blue-500" value={address} onChange={(e) => setAddress(e.target.value)} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="picName">PIC Name</Label>
                <Input id="picName" className="h-11 border-2 rounded-xl focus-visible:ring-0 focus:border-blue-500" value={picName} onChange={(e) => setPicName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="picEmail">PIC Email</Label>
                <Input type="email" id="picEmail" className="h-11 border-2 rounded-xl focus-visible:ring-0 focus:border-blue-500" value={picEmail} onChange={(e) => setPicEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="picMobile">PIC Mobile</Label>
                <Input id="picMobile" className="h-11 border-2 rounded-xl focus-visible:ring-0 focus:border-blue-500" value={picMobile} onChange={(e) => setPicMobile(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website (optional)</Label>
              <Input id="website" className="h-11 border-2 rounded-xl focus-visible:ring-0 focus:border-blue-500" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://yourcompany.com" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo">Company Logo (optional)</Label>
              <Input id="logo" type="file" className="h-11 border-2 rounded-xl focus-visible:ring-0 focus:border-blue-500" accept="image/*" onChange={(e) => setLogo(e.target.files?.[0] || null)} />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Essentials'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
