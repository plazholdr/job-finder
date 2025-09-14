'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Building2,
  Edit,
  Save,
  X,
  MapPin,
  Globe,
  Mail,
  Phone,
  Users,
  Calendar,
  CheckCircle,
  AlertCircle,
  Camera,
  Upload,
  Plus,
  Home,
  Briefcase,
  FileText,
  Target
} from 'lucide-react';
import Link from 'next/link';
import AppHeader from '@/components/layout/AppHeader';

import { useAuth } from '@/contexts/auth-context';
import { CompanyProfile } from '@/types/company';


// Resolve image src from S3-compatible key
const resolveImageSrc = (val?: string | null) => {
  if (!val) return '' as any;
  return /^https?:\/\//i.test(val) ? (val as any) : `/api/files/image?key=${encodeURIComponent(val as string)}`;
};

export default function CompanyProfilePage() {
  const router = useRouter();
  const { token, isLoading: authLoading, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<CompanyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/company/login');
      return;
    }
  }, [authLoading, isAuthenticated, router]);

  // Try once on mount using any available token (localStorage/cookies)
  useEffect(() => {
    fetchCompanyProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Also refetch whenever auth context finishes hydrating and we have a token
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchCompanyProfile();
    }
  }, [isAuthenticated, token]);

  const fetchCompanyProfile = async () => {
    try {
      setIsLoading(true);
      console.log('=== FRONTEND DEBUG ===');
      console.log('Token from useAuth:', token);
      const lsToken = typeof window !== 'undefined' ? (localStorage.getItem('authToken') || localStorage.getItem('companyToken')) : null;
      console.log('Token from localStorage:', lsToken);

      // Ensure cookies are set so server routes can read token on refresh
      if (typeof window !== 'undefined' && lsToken) {
        const maxAge = 60 * 60 * 24 * 7; // 7 days
        document.cookie = `authToken=${lsToken}; Path=/; Max-Age=${maxAge}`;
        document.cookie = `token=${lsToken}; Path=/; Max-Age=${maxAge}`;
      }


      const auth = token || lsToken;
      if (!auth) {
        console.warn('No auth token available. Redirecting to login.');
        router.push('/company/login');
        return;
      }

      const response = await fetch('/app-api/company/profile', {
        headers: { Authorization: `Bearer ${auth}` },
      });
      const result = await response.json();

      if (result.success) {
        setProfile(result.data);
        setEditedProfile(result.data);
      } else {
        setError(result.error || 'Failed to load profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile(profile);
    setError(null);
    setSuccess(null);
    setHasUnsavedChanges(false);
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const confirmCancel = window.confirm(
        'You have unsaved changes. Are you sure you want to cancel? All changes will be lost.'
      );
      if (!confirmCancel) return;
    }

    setIsEditing(false);
    setEditedProfile(profile);
    setError(null);
    setHasUnsavedChanges(false);
  };

  const handleInputChange = (field: string, value: any) => {
    if (!editedProfile) return;

    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setEditedProfile(prev => ({
        ...prev!,
        [parent]: {
          ...prev![parent as keyof CompanyProfile],
          [child]: value
        }
      }));
    } else {
      setEditedProfile(prev => ({
        ...prev!,
        [field]: value
      }));
    }
    setHasUnsavedChanges(true);
  };

  const handleArrayChange = (field: string, index: number, value: string) => {
    if (!editedProfile) return;

    const currentArray = editedProfile[field as keyof CompanyProfile] as string[];
    const newArray = [...currentArray];
    newArray[index] = value;

    setEditedProfile(prev => ({
      ...prev!,
      [field]: newArray
    }));
  };

  const addArrayItem = (field: string) => {
    if (!editedProfile) return;

    const currentArray = editedProfile[field as keyof CompanyProfile] as string[];
    setEditedProfile(prev => ({
      ...prev!,
      [field]: [...currentArray, '']
    }));
  };

  const removeArrayItem = (field: string, index: number) => {
    if (!editedProfile) return;

    const currentArray = editedProfile[field as keyof CompanyProfile] as string[];
    const newArray = currentArray.filter((_, i) => i !== index);

    setEditedProfile(prev => ({
      ...prev!,
      [field]: newArray
    }));
  };

  const handleSave = async () => {
    if (!editedProfile) return;

    // Validate required fields before saving
    const requiredFields = ['name', 'description', 'industry', 'email', 'phone', 'headquarters'];
    const missingFields = requiredFields.filter(field =>
      !editedProfile[field as keyof typeof editedProfile] ||
      String(editedProfile[field as keyof typeof editedProfile]).trim() === ''
    );

    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const lsToken = typeof window !== 'undefined' ? (localStorage.getItem('authToken') || localStorage.getItem('companyToken')) : null;
      const auth = token || lsToken;
      if (!auth) {
        console.warn('No auth token available. Redirecting to login.');
        router.push('/company/login');
        return;
      }

      const response = await fetch('/app-api/company/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth}`,
        },
        body: JSON.stringify(editedProfile),
      });

      const result = await response.json();

      if (result.success) {
        setProfile(result.data);
        setEditedProfile(result.data);
        setIsEditing(false);
        setHasUnsavedChanges(false);
        setSuccess('Profile updated successfully! Your changes have been saved.');

        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(null), 5000);
      } else {
        setError(result.error || 'Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please check your connection and try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated (this should not render due to useEffect redirect)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading company profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
            <p className="text-gray-600 mb-4">Unable to load company profile information.</p>
            <Button onClick={fetchCompanyProfile}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }




  return (
    <div className="min-h-screen bg-gray-50">
      {/* Gradient Header like landing */}
      <AppHeader />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Messages */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex items-start justify-between gap-6">
              <div className="flex items-start space-x-6">
              <div className="relative">
                <div className="h-24 w-24 bg-gray-200 rounded-lg flex items-center justify-center">
                  {profile.logo ? (
                    <img src={resolveImageSrc(profile.logo)} alt="Company Logo" className="h-full w-full object-cover rounded-lg" />
                  ) : (
                    <Building2 className="h-12 w-12 text-gray-400" />
                  )}
                </div>
                {isEditing && (
                  <button className="absolute -bottom-2 -right-2 h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700">
                    <Camera className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Company Name</Label>
                      <Input
                        id="name"
                        value={editedProfile?.name || ''}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="text-2xl font-bold"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={editedProfile?.description || ''}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{profile.name}</h1>
                    <p className="text-gray-600 mb-4">{profile.description}</p>
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {profile.headquarters}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {profile.size}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Founded {profile.founded}
                      </div>
                      <Badge className={profile.isVerified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {profile.isVerified ? 'Verified' : 'Unverified'}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
              </div>
              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <Button onClick={handleEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Update Profile
                  </Button>
                ) : (
                  <>
                    {hasUnsavedChanges && (
                      <span className="text-sm text-amber-600 flex items-center mr-2">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Unsaved changes
                      </span>
                    )}
                    <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving || !hasUnsavedChanges}>
                      {isSaving ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </div>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                      id="industry"
                      value={editedProfile?.industry || ''}
                      onChange={(e) => handleInputChange('industry', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="size">Company Size</Label>
                    <select
                      id="size"
                      value={editedProfile?.size || ''}
                      onChange={(e) => handleInputChange('size', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="startup">1-10 employees</option>
                      <option value="small">11-50 employees</option>
                      <option value="medium">51-200 employees</option>
                      <option value="large">201-1000 employees</option>
                      <option value="enterprise">1000+ employees</option>
                      </select>
                  </div>
                  <div>
                    <Label htmlFor="founded">Founded Year</Label>
                    <Input
                      id="founded"
                      type="number"
                      value={editedProfile?.founded || ''}
                      onChange={(e) => handleInputChange('founded', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={editedProfile?.website || ''}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Industry:</span>
                    <span className="font-medium">{profile.industry}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Company Size:</span>
                    <span className="font-medium">{profile.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Founded:</span>
                    <span className="font-medium">{profile.founded}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Website:</span>
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                      <Globe className="h-4 w-4 mr-1" />
                      {profile.website}
                    </a>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editedProfile?.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={editedProfile?.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="headquarters">Headquarters</Label>
                    <Input
                      id="headquarters"
                      value={editedProfile?.headquarters || ''}
                      onChange={(e) => handleInputChange('headquarters', e.target.value)}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <a href={`mailto:${profile.email}`} className="text-blue-600 hover:underline flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      {profile.email}
                    </a>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <a href={`tel:${profile.phone}`} className="text-blue-600 hover:underline flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      {profile.phone}
                    </a>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Headquarters:</span>
                    <span className="font-medium flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {profile.headquarters}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Company Culture & Values */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Company Values</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-2">
                  <Label>Values</Label>
                  {editedProfile?.values.map((value, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        value={value}
                        onChange={(e) => handleArrayChange('values', index, e.target.value)}
                        placeholder="Enter a company value"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayItem('values', index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem('values')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Value
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {profile.values.map((value, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Company Culture</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div>
                  <Label htmlFor="culture">Culture Description</Label>
                  <Textarea
                    id="culture"
                    value={editedProfile?.culture || ''}
                    onChange={(e) => handleInputChange('culture', e.target.value)}
                    rows={4}
                    placeholder="Describe your company culture..."
                  />
                </div>
              ) : (
                <p className="text-gray-700">{profile.culture}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Mission Statement</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div>
                  <Label htmlFor="mission">Mission</Label>
                  <Textarea
                    id="mission"
                    value={editedProfile?.mission || ''}
                    onChange={(e) => handleInputChange('mission', e.target.value)}
                    rows={3}
                    placeholder="Enter your company mission..."
                  />
                </div>
              ) : (
                <p className="text-gray-700">{profile.mission}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vision Statement</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div>
                  <Label htmlFor="vision">Vision</Label>
                  <Textarea
                    id="vision"
                    value={editedProfile?.vision || ''}
                    onChange={(e) => handleInputChange('vision', e.target.value)}
                    rows={3}
                    placeholder="Enter your company vision..."
                  />
                </div>
              ) : (
                <p className="text-gray-700">{profile.vision}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Benefits */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Employee Benefits</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-2">
                <Label>Benefits</Label>
                {editedProfile?.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={benefit}
                      onChange={(e) => handleArrayChange('benefits', index, e.target.value)}
                      placeholder="Enter a benefit"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('benefits', index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem('benefits')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Benefit
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {profile.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>{benefit}</span>
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
