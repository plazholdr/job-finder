import { API_BASE_URL } from "../../../config";
import CompanyDetailClient from "../../../components/CompanyDetailClient";

async function getCompany(id) {
  const res = await fetch(`${API_BASE_URL}/companies/${id}`, { next: { revalidate: 60 } });
  if (!res.ok) return null;
  return res.json();
}

async function getCompanyJobs(companyId) {
  const res = await fetch(`${API_BASE_URL}/job-listings?companyId=${companyId}`, { next: { revalidate: 60 } });
  if (!res.ok) return [];
  const json = await res.json();
  return Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
}


export default async function CompanyDetail({ params }) {
  const { id } = await params;
  const company = await getCompany(id);
  const jobs = company ? await getCompanyJobs(company._id) : [];
  return <CompanyDetailClient company={company} jobs={jobs} />;
}

