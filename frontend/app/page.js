import HomeContent from "../components/HomeContent";
import { API_BASE_URL } from "../config";

async function fetchJson(path) {
  const res = await fetch(`${API_BASE_URL}${path}`, { next: { revalidate: 60 } });
  if (!res.ok) return null;
  return res.json();
}

export default async function Home() {
  const [jobsRaw, companiesRaw] = await Promise.all([
    fetchJson('/job-listings?$limit=8'),
    fetchJson('/companies?$limit=8'),
  ]);
  const jobs = Array.isArray(jobsRaw) ? jobsRaw : (jobsRaw?.data || []);
  const companies = Array.isArray(companiesRaw) ? companiesRaw : (companiesRaw?.data || []);

  return (
    <HomeContent jobs={jobs} companies={companies} />
  );
}

