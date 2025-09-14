"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { ChevronDown, LogOut, User, Settings } from 'lucide-react';

export default function UserProfile() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Show loading state while auth is being checked
  if (isLoading) {
    return (
      <div className="flex items-center gap-3 p-2">
        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="flex flex-col gap-1">
          <div className="w-20 h-3 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-16 h-2 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const getInitials = (
    firstName?: string | null,
    lastName?: string | null,
    email?: string | null,
    companyName?: string | null,
  ) => {
    const safe = (v?: string | null) => (typeof v === 'string' ? v.trim() : '');
    const fn = safe(firstName);
    const ln = safe(lastName);
    if (fn && ln) return `${fn[0]}${ln[0]}`.toUpperCase();
    if (fn) return fn.slice(0, 2).toUpperCase();
    if (ln) return ln.slice(0, 2).toUpperCase();

    const cn = safe(companyName);
    if (cn) {
      const parts = cn.split(/\s+/).filter(Boolean);
      const initials = parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : cn.slice(0, 2);
      return initials.toUpperCase();
    }

    const em = safe(email);
    if (em) return em[0].toUpperCase();

    return 'U'; // generic fallback
  };

  // Resolve image src: if value is a key (not an absolute URL), route through our signed proxy
  const resolveImageSrc = (val?: string | null) => {
    if (!val) return '';
    return /^https?:\/\//i.test(val) ? val : `/api/files/image?key=${encodeURIComponent(val)}`;
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'student':
        return 'Student';
      case 'company':
        return 'Company';
      case 'admin':
        return 'Admin';
      default:
        return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'student':
        return 'bg-blue-100 text-blue-800';
      case 'company':
        return 'bg-green-100 text-green-800';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        {/* Profile Picture */}
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
          {user.profile?.avatar ? (
            <img
              src={resolveImageSrc(user.profile.avatar)}
              alt={`${user.firstName} ${user.lastName}`}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            getInitials(user.firstName, user.lastName, user.email, user.company?.name || null)
          )}
        </div>

        {/* User Info */}
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium text-gray-900">
            {user.firstName} {user.lastName}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRoleBadgeColor(user.role)}`}>
            {getRoleDisplayName(user.role)}
          </span>
        </div>

        {/* Dropdown Arrow */}
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform ${
            isDropdownOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsDropdownOpen(false)}
          />

          {/* Dropdown Content */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            {/* User Info Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user.profile?.avatar ? (
                    <img
                      src={resolveImageSrc(user.profile.avatar)}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    getInitials(user.firstName, user.lastName, user.email, user.company?.name || null)
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                  <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-1 ${getRoleBadgeColor(user.role)}`}>
                    {getRoleDisplayName(user.role)}
                  </span>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  const target = user.role === 'company' ? '/company/profile' : `/profile/${user._id}`;
                  router.push(target);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <User className="w-4 h-4" />
                View Profile
              </button>

              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  router.push('/settings');
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>

              <hr className="my-2 border-gray-100" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
