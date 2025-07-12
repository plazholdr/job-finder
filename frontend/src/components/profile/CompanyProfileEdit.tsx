"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Save, 
  Plus, 
  Trash2, 
  Upload,
  Building2,
  MapPin,
  Star,
  Users
} from 'lucide-react';

interface CompanyProfileEditProps {
  user: any;
  onSave: (data: any) => void;
  saving: boolean;
}

export default function CompanyProfileEdit({ user, onSave, saving }: CompanyProfileEditProps) {
  const [formData, setFormData] = useState({
    // Basic Profile
    profile: {
      phone: user.profile?.phone || '',
      location: user.profile?.location || '',
      website: user.profile?.website || '',
      linkedin: user.profile?.linkedin || '',
    },
    // Company Specific
    company: {
      name: user.company?.name || '',
      description: user.company?.description || '',
      industry: user.company?.industry || '',
      size: user.company?.size || '',
      founded: user.company?.founded || '',
      type: user.company?.type || '',
      about: user.company?.about || '',
      culture: user.company?.culture || '',
      website: user.company?.website || '',
      linkedin: user.company?.linkedin || '',
      phone: user.company?.phone || '',
      location: user.company?.location || '',
      specialties: user.company?.specialties || [],
      benefits: user.company?.benefits || [],
      offices: user.company?.offices || [],
    }
  });

  const [newSpecialty, setNewSpecialty] = useState('');
  const [newBenefit, setNewBenefit] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addSpecialty = () => {
    if (newSpecialty.trim()) {
      setFormData(prev => ({
        ...prev,
        company: {
          ...prev.company,
          specialties: [...prev.company.specialties, newSpecialty.trim()]
        }
      }));
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (index: number) => {
    setFormData(prev => ({
      ...prev,
      company: {
        ...prev.company,
        specialties: prev.company.specialties.filter((_: any, i: number) => i !== index)
      }
    }));
  };

  const addBenefit = () => {
    if (newBenefit.trim()) {
      setFormData(prev => ({
        ...prev,
        company: {
          ...prev.company,
          benefits: [...prev.company.benefits, newBenefit.trim()]
        }
      }));
      setNewBenefit('');
    }
  };

  const removeBenefit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      company: {
        ...prev.company,
        benefits: prev.company.benefits.filter((_: any, i: number) => i !== index)
      }
    }));
  };

  const addOffice = () => {
    setFormData(prev => ({
      ...prev,
      company: {
        ...prev.company,
        offices: [...prev.company.offices, {
          name: '',
          address: '',
          description: ''
        }]
      }
    }));
  };

  const updateOffice = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      company: {
        ...prev.company,
        offices: prev.company.offices.map((office: any, i: number) => 
          i === index ? { ...office, [field]: value } : office
        )
      }
    }));
  };

  const removeOffice = (index: number) => {
    setFormData(prev => ({
      ...prev,
      company: {
        ...prev.company,
        offices: prev.company.offices.filter((_: any, i: number) => i !== index)
      }
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Company Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Company Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name *
            </label>
            <Input
              value={formData.company.name}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                company: { ...prev.company, name: e.target.value }
              }))}
              placeholder="Your Company Name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Industry
            </label>
            <Input
              value={formData.company.industry}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                company: { ...prev.company, industry: e.target.value }
              }))}
              placeholder="e.g., Technology, Healthcare, Finance"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Size
            </label>
            <select
              value={formData.company.size}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                company: { ...prev.company, size: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select size</option>
              <option value="1-10">1-10</option>
              <option value="11-50">11-50</option>
              <option value="51-200">51-200</option>
              <option value="201-500">201-500</option>
              <option value="501-1000">501-1000</option>
              <option value="1000+">1000+</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Founded Year
            </label>
            <Input
              value={formData.company.founded}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                company: { ...prev.company, founded: e.target.value }
              }))}
              placeholder="2020"
              type="number"
              min="1800"
              max={new Date().getFullYear()}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Type
            </label>
            <select
              value={formData.company.type}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                company: { ...prev.company, type: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select type</option>
              <option value="Startup">Startup</option>
              <option value="Private Company">Private Company</option>
              <option value="Public Company">Public Company</option>
              <option value="Non-profit">Non-profit</option>
              <option value="Government">Government</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Headquarters Location
            </label>
            <Input
              value={formData.company.location}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                company: { ...prev.company, location: e.target.value }
              }))}
              placeholder="City, State/Country"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Description
          </label>
          <Textarea
            value={formData.company.description}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              company: { ...prev.company, description: e.target.value }
            }))}
            placeholder="Brief description of your company..."
            rows={3}
          />
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Contact Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Website
            </label>
            <Input
              value={formData.company.website}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                company: { ...prev.company, website: e.target.value }
              }))}
              placeholder="https://yourcompany.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              LinkedIn Company Page
            </label>
            <Input
              value={formData.company.linkedin}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                company: { ...prev.company, linkedin: e.target.value }
              }))}
              placeholder="https://linkedin.com/company/yourcompany"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <Input
              value={formData.company.phone}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                company: { ...prev.company, phone: e.target.value }
              }))}
              placeholder="+60 3-1234 5678"
            />
          </div>
        </div>
      </div>

      {/* About & Culture */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">About & Culture</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              About Us
            </label>
            <Textarea
              value={formData.company.about}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                company: { ...prev.company, about: e.target.value }
              }))}
              placeholder="Tell us more about your company, mission, and values..."
              rows={4}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Culture
            </label>
            <Textarea
              value={formData.company.culture}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                company: { ...prev.company, culture: e.target.value }
              }))}
              placeholder="Describe your company culture and work environment..."
              rows={4}
            />
          </div>
        </div>
      </div>

      {/* Specialties */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Specialties</h2>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newSpecialty}
              onChange={(e) => setNewSpecialty(e.target.value)}
              placeholder="Add a specialty"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialty())}
            />
            <Button type="button" onClick={addSpecialty} variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.company.specialties.map((specialty: string, index: number) => (
              <div key={index} className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {specialty}
                <button
                  type="button"
                  onClick={() => removeSpecialty(index)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={saving} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Company Profile'}
        </Button>
      </div>
    </form>
  );
}
