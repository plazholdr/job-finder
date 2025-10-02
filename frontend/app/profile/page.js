"use client";
import React, { Suspense } from 'react';
import ProfilePageInner from '../../components/ProfilePageInner';

export default function StudentProfilePage() {
  return (
    <Suspense fallback={null}>
      <ProfilePageInner />
    </Suspense>
  );
}
