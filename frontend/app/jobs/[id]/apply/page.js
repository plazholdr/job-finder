"use client";
import { useParams } from 'next/navigation';
import ApplyJobClient from '../../../../components/ApplyJobClient';

export default function ApplyJobPage(){
  const params = useParams();
  const id = params?.id;
  return <ApplyJobClient jobId={id} />;
}

