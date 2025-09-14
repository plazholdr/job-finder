'use client';

import React from 'react';
import UniversalHeader, { HeaderVariant, HeaderTheme } from './UniversalHeader';
import HeroBanner, { BannerVariant, BannerSize } from './HeroBanner';
import { InternWorkflowProvider } from '@/contexts/InternWorkflowContext';

interface PageLayoutProps {
  children: React.ReactNode;
  
  // Header configuration
  headerVariant?: HeaderVariant;
  headerTheme?: HeaderTheme;
  showHeader?: boolean;
  headerSticky?: boolean;
  headerClassName?: string;
  
  // Banner configuration
  showBanner?: boolean;
  bannerVariant?: BannerVariant;
  bannerSize?: BannerSize;
  bannerTitle?: string;
  bannerSubtitle?: string;
  bannerHighlightText?: string;
  bannerShowSearch?: boolean;
  bannerSearchPlaceholder?: string;
  bannerSearchValue?: string;
  bannerOnSearchChange?: (value: string) => void;
  bannerShowFilters?: boolean;
  bannerOnFiltersClick?: () => void;
  bannerBackgroundImage?: string;
  bannerCustomBackground?: string;
  bannerActions?: React.ReactNode;
  bannerStats?: Array<{
    value: string;
    label: string;
    color?: string;
  }>;
  
  // User and navigation
  user?: {
    id: string;
    name: string;
    email: string;
    role: 'intern' | 'company' | 'admin';
  };
  
  // Layout options
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';
  padding?: boolean;
  background?: string;
  className?: string;
  
  // Workflow provider
  includeWorkflowProvider?: boolean;
}

const getMaxWidthClass = (maxWidth: string) => {
  const widths = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full'
  };
  return widths[maxWidth as keyof typeof widths] || 'max-w-7xl';
};

export default function PageLayout({
  children,
  
  // Header props
  headerVariant = 'default',
  headerTheme = 'light',
  showHeader = true,
  headerSticky = true,
  headerClassName = '',
  
  // Banner props
  showBanner = false,
  bannerVariant = 'gradient',
  bannerSize = 'lg',
  bannerTitle = '',
  bannerSubtitle,
  bannerHighlightText,
  bannerShowSearch = false,
  bannerSearchPlaceholder = 'Search...',
  bannerSearchValue = '',
  bannerOnSearchChange,
  bannerShowFilters = false,
  bannerOnFiltersClick,
  bannerBackgroundImage,
  bannerCustomBackground,
  bannerActions,
  bannerStats,
  
  // User and navigation
  user,
  
  // Layout options
  maxWidth = '7xl',
  padding = true,
  background = 'bg-gray-50',
  className = '',
  
  // Workflow provider
  includeWorkflowProvider = false
}: PageLayoutProps) {
  
  const content = (
    <div className={`min-h-screen ${background} ${className}`}>
      {/* Header */}
      {showHeader && (
        <UniversalHeader
          variant={headerVariant}
          theme={headerTheme}
          user={user}
          sticky={headerSticky}
          className={headerClassName}
        />
      )}

      {/* Banner/Hero Section */}
      {showBanner && bannerTitle && (
        <HeroBanner
          variant={bannerVariant}
          size={bannerSize}
          title={bannerTitle}
          subtitle={bannerSubtitle}
          highlightText={bannerHighlightText}
          showSearch={bannerShowSearch}
          searchPlaceholder={bannerSearchPlaceholder}
          searchValue={bannerSearchValue}
          onSearchChange={bannerOnSearchChange}
          showFilters={bannerShowFilters}
          onFiltersClick={bannerOnFiltersClick}
          backgroundImage={bannerBackgroundImage}
          customBackground={bannerCustomBackground}
          actions={bannerActions}
          stats={bannerStats}
        />
      )}

      {/* Main Content */}
      <main className="flex-1">
        {padding ? (
          <div className={`${getMaxWidthClass(maxWidth)} mx-auto px-4 sm:px-6 lg:px-8 py-8`}>
            {children}
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );

  // Wrap with workflow provider if needed
  if (includeWorkflowProvider) {
    return (
      <InternWorkflowProvider>
        {content}
      </InternWorkflowProvider>
    );
  }

  return content;
}

// Preset layout configurations for common page types
export const LayoutPresets = {
  // Landing page with wave banner
  landing: {
    headerVariant: 'landing' as HeaderVariant,
    headerTheme: 'gradient' as HeaderTheme,
    showBanner: true,
    bannerVariant: 'wave' as BannerVariant,
    bannerSize: 'lg' as BannerSize,
    bannerShowSearch: true,
    bannerShowFilters: true
  },

  // Standard authenticated page
  dashboard: {
    headerVariant: 'default' as HeaderVariant,
    headerTheme: 'light' as HeaderTheme,
    showBanner: false,
    includeWorkflowProvider: true
  },

  // Company dashboard
  company: {
    headerVariant: 'company' as HeaderVariant,
    headerTheme: 'light' as HeaderTheme,
    showBanner: false
  },

  // Admin dashboard
  admin: {
    headerVariant: 'admin' as HeaderVariant,
    headerTheme: 'dark' as HeaderTheme,
    showBanner: false,
    background: 'bg-gray-900'
  },

  // Auth pages (login/register)
  auth: {
    headerVariant: 'auth' as HeaderVariant,
    headerTheme: 'transparent' as HeaderTheme,
    showHeader: false,
    showBanner: false,
    background: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50',
    padding: false
  },

  // Simple content page
  content: {
    headerVariant: 'default' as HeaderVariant,
    headerTheme: 'light' as HeaderTheme,
    showBanner: false,
    maxWidth: '4xl' as const
  }
};

// Helper function to create a layout with preset
export function createLayoutWithPreset(
  preset: keyof typeof LayoutPresets,
  overrides: Partial<PageLayoutProps> = {}
) {
  return function LayoutComponent(props: Partial<PageLayoutProps>) {
    const presetConfig = LayoutPresets[preset];
    const finalProps = { ...presetConfig, ...overrides, ...props };
    return <PageLayout {...finalProps} />;
  };
}

// Export preset components for convenience
export const LandingLayout = createLayoutWithPreset('landing');
export const DashboardLayout = createLayoutWithPreset('dashboard');
export const CompanyLayout = createLayoutWithPreset('company');
export const AdminLayout = createLayoutWithPreset('admin');
export const AuthLayout = createLayoutWithPreset('auth');
export const ContentLayout = createLayoutWithPreset('content');
