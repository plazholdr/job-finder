'use client';

import React, { useState } from 'react';
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
  Target,
  Menu,
  X
} from 'lucide-react';
import UserProfile from '@/components/UserProfile';
import NotificationCenter from '@/components/notifications/NotificationCenter';

// Header variant types
export type HeaderVariant = 'default' | 'landing' | 'auth' | 'company' | 'admin';

// Header theme types  
export type HeaderTheme = 'light' | 'dark' | 'gradient' | 'transparent';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  badge?: string;
  roles?: string[];
}

interface UniversalHeaderProps {
  variant?: HeaderVariant;
  theme?: HeaderTheme;
  user?: {
    id: string;
    name: string;
    email: string;
    role: 'intern' | 'company' | 'admin';
  };
  customNavItems?: NavigationItem[];
  showSearch?: boolean;
  showNotifications?: boolean;
  showProfile?: boolean;
  sticky?: boolean;
  className?: string;
  logoHref?: string;
  brandName?: string;
  rightActions?: React.ReactNode;
}

// Default navigation items for different user roles
const getDefaultNavItems = (userRole?: string): NavigationItem[] => {
  const baseItems: NavigationItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      description: 'Overview and quick actions'
    }
  ];

  const internItems: NavigationItem[] = [
    ...baseItems,
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
      name: 'Applications',
      href: '/applications',
      icon: FileText,
      description: 'Track your applications'
    }
  ];

  const companyItems: NavigationItem[] = [
    ...baseItems,
    {
      name: 'Jobs',
      href: '/company/jobs',
      icon: Briefcase,
      description: 'Manage job postings'
    },
    {
      name: 'Applications',
      href: '/company/applications',
      icon: FileText,
      description: 'Review applications'
    },
    {
      name: 'Analytics',
      href: '/company/analytics',
      icon: Target,
      description: 'View performance metrics'
    }
  ];

  const adminItems: NavigationItem[] = [
    ...baseItems,
    {
      name: 'Users',
      href: '/admin/users',
      icon: User,
      description: 'Manage users'
    },
    {
      name: 'Companies',
      href: '/admin/companies',
      icon: Building2,
      description: 'Manage companies'
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: Award,
      description: 'System analytics'
    }
  ];

  switch (userRole) {
    case 'company':
      return companyItems;
    case 'admin':
      return adminItems;
    case 'intern':
    default:
      return internItems;
  }
};

// Theme configurations
const getThemeClasses = (theme: HeaderTheme, variant: HeaderVariant) => {
  const themes = {
    light: {
      header: 'bg-white shadow-sm border-b',
      text: 'text-gray-900',
      logo: 'bg-blue-600',
      logoText: 'text-white',
      brandText: 'text-gray-900',
      button: 'text-gray-600 hover:text-gray-900',
      activeButton: 'bg-blue-600 text-white',
      mobile: 'bg-gray-50 border-t'
    },
    dark: {
      header: 'bg-gray-900 shadow-sm border-b border-gray-800',
      text: 'text-white',
      logo: 'bg-blue-600',
      logoText: 'text-white',
      brandText: 'text-white',
      button: 'text-gray-300 hover:text-white',
      activeButton: 'bg-blue-600 text-white',
      mobile: 'bg-gray-800 border-t border-gray-700'
    },
    gradient: {
      header: 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 border-b border-blue-500 shadow-lg',
      text: 'text-white',
      logo: 'bg-white/20 backdrop-blur-sm border border-white/30',
      logoText: 'text-white',
      brandText: 'text-white',
      button: 'text-white hover:bg-white/20',
      activeButton: 'bg-white/30 text-white',
      mobile: 'bg-black/20 border-t border-white/20'
    },
    transparent: {
      header: 'bg-transparent',
      text: 'text-white',
      logo: 'bg-white/20 backdrop-blur-sm',
      logoText: 'text-white',
      brandText: 'text-white',
      button: 'text-white hover:bg-white/20',
      activeButton: 'bg-white/30 text-white',
      mobile: 'bg-black/20 border-t border-white/20'
    }
  };

  return themes[theme];
};

export default function UniversalHeader({
  variant = 'default',
  theme = 'light',
  user,
  customNavItems,
  showSearch = true,
  showNotifications = true,
  showProfile = true,
  sticky = true,
  className = '',
  logoHref = '/',
  brandName = 'JobFinder',
  rightActions
}: UniversalHeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Determine navigation items
  const navigationItems = customNavItems || getDefaultNavItems(user?.role);
  
  // Get theme classes
  const themeClasses = getThemeClasses(theme, variant);

  // Check if a path is active
  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  // Filter nav items based on user role
  const filteredNavItems = navigationItems.filter(item => 
    !item.roles || item.roles.includes(user?.role || 'intern')
  );

  return (
    <header className={`
      ${themeClasses.header}
      ${sticky ? 'sticky top-0 z-50' : ''}
      ${className}
    `}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href={logoHref} className="flex items-center space-x-2">
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${themeClasses.logo}`}>
                {variant === 'landing' ? (
                  <span className={`font-bold text-sm ${themeClasses.logoText}`}>JF</span>
                ) : (
                  <Briefcase className={`h-5 w-5 ${themeClasses.logoText}`} />
                )}
              </div>
              <span className={`text-xl font-bold ${themeClasses.brandText}`}>
                {brandName}
              </span>
            </Link>
          </div>

          {/* Main Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`flex items-center space-x-2 ${
                      active ? themeClasses.activeButton : themeClasses.button
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-1">
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* Custom Right Actions */}
            {rightActions}

            {/* Search */}
            {showSearch && (
              <Button 
                variant="ghost" 
                size="sm" 
                className={`hidden lg:flex ${themeClasses.button}`}
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            )}

            {/* Notifications */}
            {showNotifications && user && <NotificationCenter />}

            {/* Profile */}
            {showProfile && <UserProfile />}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className={`md:hidden ${themeClasses.button}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className={`md:hidden ${themeClasses.mobile}`}>
          <div className="px-4 py-2">
            <div className="space-y-1">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link 
                    key={item.name} 
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`w-full justify-start ${
                        active ? themeClasses.activeButton : themeClasses.button
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      {item.name}
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
