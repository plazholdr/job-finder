'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  Briefcase,
  BookOpen,
  Star,
  FileText,
  User,
  Bell,
  Search,
  Home,
  Award,
  Target
} from 'lucide-react';
import UserProfile from '@/components/UserProfile';
import NotificationCenter from '@/components/notifications/NotificationCenter';

interface MainNavigationProps {
  user?: {
    id: string;
    name: string;
    email: string;
    role: 'intern' | 'company' | 'admin';
  };
}

export default function MainNavigation({ user }: MainNavigationProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      description: 'Overview and quick actions'
    },
    {
      name: 'Companies',
      href: '/companies',
      icon: Building2,
      description: 'Browse companies offering internships'
    },
    {
      name: 'Jobs',
      href: '/jobs',
      icon: Briefcase,
      description: 'Find internship opportunities'
    },
    {
      name: 'Internships',
      href: '/internship',
      icon: BookOpen,
      description: 'Manage your internship profile'
    },
    {
      name: 'Saved',
      href: '/saved-jobs',
      icon: Star,
      description: 'Your liked companies and jobs'
    },
    {
      name: 'Intern Management',
      href: '/intern-management',
      icon: User,
      description: 'Comprehensive application management'
    },
    {
      name: 'Hiring & Onboarding',
      href: '/hiring',
      icon: Award,
      description: 'Track your internship journey'
    },
    {
      name: 'Applications',
      href: '/applications',
      icon: FileText,
      description: 'Track your applications'
    },
    {
      name: 'Workflow',
      href: '/workflow',
      icon: Target,
      description: 'Complete workflow overview'
    },
  ];

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">JobFinder</span>
            </Link>
          </div>

          {/* Main Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={active ? "default" : "ghost"}
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <Button variant="ghost" size="sm" className="hidden lg:flex">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>

            {/* Notifications */}
            {user && <NotificationCenter />}

            {/* Profile */}
            <UserProfile />
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t bg-gray-50">
        <div className="px-4 py-2">
          <div className="flex items-center justify-between space-x-1 overflow-x-auto">
            {navigationItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link key={item.name} href={item.href} className="flex-shrink-0">
                  <Button
                    variant={active ? "default" : "ghost"}
                    size="sm"
                    className="flex flex-col items-center space-y-1 h-auto py-2 px-3"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-xs">{item.name}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}

// Quick Actions Component for Dashboard
export function QuickActions() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/companies">
          <Button variant="outline" className="w-full justify-start">
            <Building2 className="h-4 w-4 mr-2" />
            Browse Companies
          </Button>
        </Link>

        <Link href="/jobs">
          <Button variant="outline" className="w-full justify-start">
            <Briefcase className="h-4 w-4 mr-2" />
            Find Jobs
          </Button>
        </Link>

        <Link href="/internship">
          <Button variant="outline" className="w-full justify-start">
            <BookOpen className="h-4 w-4 mr-2" />
            Manage Profile
          </Button>
        </Link>

        <Link href="/applications">
          <Button variant="outline" className="w-full justify-start">
            <FileText className="h-4 w-4 mr-2" />
            My Applications
          </Button>
        </Link>
      </div>
    </div>
  );
}

// Breadcrumb Component
interface BreadcrumbItem {
  name: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <span className="text-gray-400 mx-2">/</span>
            )}
            {item.href ? (
              <Link
                href={item.href}
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                {item.name}
              </Link>
            ) : (
              <span className="text-gray-900 text-sm font-medium">
                {item.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
