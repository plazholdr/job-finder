"use client";
import { Suspense } from 'react';
import ProfilePageInner from '../../components/ProfilePageInner';

export default function StudentProfilePage() {
  return (
    <Suspense fallback={<div />}>
      <ProfilePageInner />
    </Suspense>
  );
}
