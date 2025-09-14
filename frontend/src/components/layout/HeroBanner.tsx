'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';

export type BannerVariant = 'wave' | 'gradient' | 'solid' | 'image';
export type BannerSize = 'sm' | 'md' | 'lg' | 'xl';

interface HeroBannerProps {
  variant?: BannerVariant;
  size?: BannerSize;
  title: string;
  subtitle?: string;
  highlightText?: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  showFilters?: boolean;
  onFiltersClick?: () => void;
  backgroundImage?: string;
  customBackground?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  textAlign?: 'left' | 'center' | 'right';
  overlay?: boolean;
  stats?: Array<{
    value: string;
    label: string;
    color?: string;
  }>;
}

// Size configurations
const getSizeClasses = (size: BannerSize) => {
  const sizes = {
    sm: {
      container: 'py-8',
      title: 'text-2xl md:text-3xl',
      subtitle: 'text-lg',
      spacing: 'mb-4'
    },
    md: {
      container: 'py-12',
      title: 'text-3xl md:text-4xl',
      subtitle: 'text-xl',
      spacing: 'mb-6'
    },
    lg: {
      container: 'py-16',
      title: 'text-4xl md:text-6xl',
      subtitle: 'text-xl',
      spacing: 'mb-8'
    },
    xl: {
      container: 'py-20',
      title: 'text-5xl md:text-7xl',
      subtitle: 'text-2xl',
      spacing: 'mb-10'
    }
  };
  return sizes[size];
};

// Background variant configurations
const getVariantClasses = (variant: BannerVariant, customBackground?: string) => {
  const variants = {
    wave: {
      container: 'wave-background relative',
      text: 'text-white',
      highlightText: 'text-blue-200',
      searchInput: 'bg-white/95 backdrop-blur-sm border-white/20 focus:border-white/40',
      filterButton: 'bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/40'
    },
    gradient: {
      container: 'bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative',
      text: 'text-white',
      highlightText: 'text-blue-200',
      searchInput: 'bg-white/90 backdrop-blur-sm border-white/20 focus:border-white/40',
      filterButton: 'bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/40'
    },
    solid: {
      container: customBackground || 'bg-blue-600',
      text: 'text-white',
      highlightText: 'text-blue-200',
      searchInput: 'bg-white/90 backdrop-blur-sm border-white/20 focus:border-white/40',
      filterButton: 'bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/40'
    },
    image: {
      container: 'relative bg-cover bg-center bg-no-repeat',
      text: 'text-white',
      highlightText: 'text-blue-200',
      searchInput: 'bg-white/95 backdrop-blur-sm border-white/20 focus:border-white/40',
      filterButton: 'bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/40'
    }
  };
  return variants[variant];
};

export default function HeroBanner({
  variant = 'gradient',
  size = 'lg',
  title,
  subtitle,
  highlightText,
  showSearch = false,
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearchChange,
  showFilters = false,
  onFiltersClick,
  backgroundImage,
  customBackground,
  children,
  actions,
  className = '',
  textAlign = 'center',
  overlay = true,
  stats
}: HeroBannerProps) {
  const sizeClasses = getSizeClasses(size);
  const variantClasses = getVariantClasses(variant, customBackground);

  // Parse title to handle highlight text
  const renderTitle = () => {
    if (!highlightText) {
      return <span>{title}</span>;
    }

    const parts = title.split(highlightText);
    if (parts.length === 1) {
      return <span>{title}</span>;
    }

    return (
      <>
        {parts[0]}
        <span className={variantClasses.highlightText}>{highlightText}</span>
        {parts[1]}
      </>
    );
  };

  const containerStyle = backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : {};

  return (
    <section 
      className={`
        ${variantClasses.container}
        ${sizeClasses.container}
        ${className}
      `}
      style={containerStyle}
    >
      {/* Wave SVG for wave variant */}
      {variant === 'wave' && (
        <svg className="wave-svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25"></path>
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5"></path>
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path>
        </svg>
      )}

      {/* Overlay for image variant */}
      {variant === 'image' && overlay && (
        <div className="absolute inset-0 bg-black/40"></div>
      )}

      {/* Content */}
      <div className={`
        ${variant === 'wave' ? 'wave-content' : 'relative z-10'}
        max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
        ${textAlign === 'center' ? 'text-center' : textAlign === 'right' ? 'text-right' : 'text-left'}
      `}>
        {/* Title */}
        <h1 className={`
          ${sizeClasses.title} 
          font-bold 
          ${variantClasses.text} 
          ${sizeClasses.spacing}
        `}>
          {renderTitle()}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p className={`
            ${sizeClasses.subtitle} 
            ${variantClasses.text === 'text-white' ? 'text-blue-100' : 'text-gray-600'} 
            ${sizeClasses.spacing} 
            max-w-3xl 
            ${textAlign === 'center' ? 'mx-auto' : ''}
          `}>
            {subtitle}
          </p>
        )}

        {/* Search Bar */}
        {showSearch && (
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  className={`pl-10 h-12 text-lg ${variantClasses.searchInput}`}
                />
              </div>
              {showFilters && (
                <Button
                  variant="outline"
                  onClick={onFiltersClick}
                  className={`h-12 px-6 ${variantClasses.filterButton}`}
                >
                  <Filter className="h-5 w-5 mr-2" />
                  Filters
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Custom Actions */}
        {actions && (
          <div className={`${sizeClasses.spacing}`}>
            {actions}
          </div>
        )}

        {/* Stats */}
        {stats && stats.length > 0 && (
          <div className="flex flex-wrap justify-center gap-8 mt-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`text-3xl font-bold ${stat.color || variantClasses.text}`}>
                  {stat.value}
                </div>
                <div className={`text-sm ${variantClasses.text === 'text-white' ? 'text-blue-100' : 'text-gray-600'}`}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Custom Children */}
        {children}
      </div>
    </section>
  );
}
