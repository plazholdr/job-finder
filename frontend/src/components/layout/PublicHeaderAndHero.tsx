'use client';

import React from 'react';
import AppHeader from '@/components/layout/AppHeader';

export default function PublicHeaderAndHero() {
  return (
    <>
      <AppHeader />
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Find Your Dream <span className="text-blue-600">Internship</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover amazing companies offering internship opportunities. Browse, search, and connect with top employers.
          </p>
        </div>
      </section>
    </>
  );
}

