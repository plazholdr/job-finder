'use client';

import React, { useState } from 'react';
import { Menu, X, LogOut, Settings as SettingsIcon, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/contexts/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Resolve image src from S3 key or full URL
const resolveImageSrc = (val?: string | null) => {
  if (!val) return '' as any;
  return /^https?:\/\//i.test(val) ? (val as any) : `/api/files/image?key=${encodeURIComponent(val as string)}`;
};

interface AppHeaderProps {
  showAuthButtons?: boolean;
  variant?: 'default' | 'auth';
  className?: string;
}

export default function AppHeader({
  showAuthButtons = true,
  variant = 'default',
  className = ''
}: AppHeaderProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);



  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const baseClasses = "bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 border-b border-blue-500 sticky top-0 z-50 shadow-lg";
  const authClasses = "bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 shadow-lg";

  const headerClasses = variant === 'auth' ? authClasses : baseClasses;

  return (
    <nav className={`${headerClasses} ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 border border-white/30">
                <span className="text-white font-bold text-sm">JF</span>
              </div>
              <span className="ml-3 text-xl font-bold text-white">JobFinder</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <Link href="/jobs" className="text-white/80 hover:text-white font-medium transition-colors duration-200 hover:bg-white/10 px-3 py-2 rounded-md">
              Jobs
            </Link>
            <Link href="/companies" className="text-white/80 hover:text-white font-medium transition-colors duration-200 hover:bg-white/10 px-3 py-2 rounded-md">
              Companies
            </Link>
            <Link href="/about" className="text-white/80 hover:text-white font-medium transition-colors duration-200 hover:bg-white/10 px-3 py-2 rounded-md">
              About
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {/* Right side: auth buttons or user menu */}
            {isAuthenticated && user ? (
              <div className="hidden md:flex items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-3 rounded-full px-2 py-1 hover:bg-white/10 text-white">
                      <Avatar className="h-9 w-9 border border-white/30">
                        <AvatarImage src={resolveImageSrc(user.profile?.avatar || user.company?.logo || '')} alt={user.firstName} />
                        <AvatarFallback className="bg-white/20 text-white font-semibold">
                          {(user.firstName?.[0] || '') + (user.lastName?.[0] || '') || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden lg:flex flex-col items-start">
                        <span className="text-sm font-semibold leading-tight">{user.firstName} {user.lastName}</span>
                        <span className="text-xs text-white/70 capitalize">{user.role}</span>
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={resolveImageSrc(user.profile?.avatar || user.company?.logo || '')} />
                          <AvatarFallback>{(user.firstName?.[0] || '') + (user.lastName?.[0] || '') || 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.firstName} {user.lastName}</div>
                          <div className="text-xs text-muted-foreground capitalize">{user.role}</div>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={user.role === 'company' ? '/company/profile' : '/'} className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4" /> Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={user.role === 'company' ? '/company/settings' : '/settings'} className="flex items-center gap-2">
                        <SettingsIcon className="h-4 w-4" /> Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                      <LogOut className="h-4 w-4 mr-2" /> Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              showAuthButtons && (
                <div className="hidden md:flex items-center space-x-4">
                  <Link href="/auth/login">
                    <Button variant="ghost" className="text-white hover:bg-white/20 border-white/30">Login</Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button className="bg-white text-blue-600 hover:bg-gray-100 font-semibold">Get Started</Button>
                  </Link>
                </div>
              )
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-white hover:bg-white/20"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-white/20 py-4 bg-white/10 backdrop-blur-sm">
            <div className="flex flex-col space-y-4">
              <Link href="/jobs" className="text-white/80 hover:text-white font-medium px-4 py-2 hover:bg-white/10 rounded-md mx-2 transition-colors">
                Jobs
              </Link>
              <Link href="/companies" className="text-white/80 hover:text-white font-medium px-4 py-2 hover:bg-white/10 rounded-md mx-2 transition-colors">
                Companies
              </Link>
              <Link href="/about" className="text-white/80 hover:text-white font-medium px-4 py-2 hover:bg-white/10 rounded-md mx-2 transition-colors">
                About
              </Link>
              {isAuthenticated && user ? (
                <div className="flex flex-col space-y-2 px-4 pt-4 border-t border-white/20">
                  <div className="flex items-center gap-3 px-2 py-1">
                    <Avatar className="h-9 w-9 border border-white/30">
                      <AvatarImage src={resolveImageSrc(user.profile?.avatar || user.company?.logo || '')} />
                      <AvatarFallback className="bg-white/20 text-white font-semibold">
                        {(user.firstName?.[0] || '') + (user.lastName?.[0] || '') || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-white">
                      <div className="font-semibold leading-tight">{user.firstName} {user.lastName}</div>
                      <div className="text-xs text-white/70 capitalize">{user.role}</div>
                    </div>
                  </div>
                  <Link href={user.role === 'company' ? '/company/profile' : '/'}>
                    <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/20">Dashboard</Button>
                  </Link>
                  <Link href={user.role === 'company' ? '/company/settings' : '/settings'}>
                    <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/20">Settings</Button>
                  </Link>
                  <Button variant="ghost" className="w-full justify-start text-red-100 hover:bg-white/10" onClick={handleLogout}>
                    Sign out
                  </Button>
                </div>
              ) : (
                showAuthButtons && (
                  <div className="flex flex-col space-y-2 px-4 pt-4 border-t border-white/20">
                    <Link href="/auth/login">
                      <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/20">Login</Button>
                    </Link>
                    <Link href="/auth/register">
                      <Button className="w-full bg-white text-blue-600 hover:bg-gray-100">Get Started</Button>
                    </Link>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
