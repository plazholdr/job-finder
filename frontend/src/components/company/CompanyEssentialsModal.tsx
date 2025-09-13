"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';

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
    return user?.role === 'company' && user?.company?.approvalStatusCode === 1;
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

      const res = await fetch('/api/company/essentials', {
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
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Complete your company essentials</DialogTitle>
          <DialogDescription>
            Please provide basic company information so candidates can learn about your organisation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description">Company Description</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nature">Nature of Business</Label>
              <Input id="nature" value={nature} onChange={(e) => setNature(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Headquarters / Address</Label>
              <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="picName">PIC Name</Label>
                <Input id="picName" value={picName} onChange={(e) => setPicName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="picEmail">PIC Email</Label>
                <Input type="email" id="picEmail" value={picEmail} onChange={(e) => setPicEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="picMobile">PIC Mobile</Label>
                <Input id="picMobile" value={picMobile} onChange={(e) => setPicMobile(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website (optional)</Label>
              <Input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://yourcompany.com" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo">Company Logo (optional)</Label>
              <Input id="logo" type="file" accept="image/*" onChange={(e) => setLogo(e.target.files?.[0] || null)} />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save Essentials'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
