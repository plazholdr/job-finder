import { API_BASE_URL } from "../../../config";
import JobDetailClient from "../../../components/JobDetailClient";

async function getJob(id) {
  const res = await fetch(`${API_BASE_URL}/job-listings/${id}`, { next: { revalidate: 60 } });
  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const job = await getJob(id);

  if (!job) {
    return {
      title: "Job Not Found",
      description: "The requested job listing could not be found."
    };
  }

  return {
    title: `${job.title} at ${job.company?.name || 'Company'}`,
    description: job.description || `${job.title} position available at ${job.company?.name || 'our company'}. Apply now!`,
    openGraph: {
      title: `${job.title} at ${job.company?.name || 'Company'}`,
      description: job.description || `${job.title} position available at ${job.company?.name || 'our company'}. Apply now!`,
      type: 'website',
    },
  };
}

export default async function JobDetail({ params }) {
  const { id } = await params; // Next.js 15: await params
  const job = await getJob(id);
  return <JobDetailClient job={job} />;
}

