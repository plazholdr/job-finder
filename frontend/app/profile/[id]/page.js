"use client";
import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import ProfilePageInner from '../../../components/ProfilePageInner';

function ProfileByIdInner(){
  const params = useParams();
  const id = params?.id || null;
  return <ProfilePageInner targetIdProp={id} />;
}

export default function ProfileByIdPage(){
  return (
    <Suspense fallback={<div />}> 
      <ProfileByIdInner />
    </Suspense>
  );
}

