import { API_BASE_URL } from "../../../config";
import JobDetailClient from "../../../components/JobDetailClient";

async function getJob(id) {
  const res = await fetch(`${API_BASE_URL}/job-listings/${id}`, { next: { revalidate: 60 } });
  if (!res.ok) return null;
  return res.json();
}

export default async function JobDetail({ params }) {
  const { id } = await params; // Next.js 15: await params
  const job = await getJob(id);
  return <JobDetailClient job={job} />;
}

