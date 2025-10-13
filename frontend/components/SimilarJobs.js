"use client";
import { useState, useEffect } from 'react';
import { Card, Space, Typography, Spin, Alert, theme as antdTheme } from 'antd';
import { EnvironmentOutlined, BankOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { formatDate } from '../utils/formatters';
import { API_BASE_URL } from '../config';

const { Text } = Typography;

// Component to display a job logo with fallback
function JobLogo({ job, size = 40 }) {
  const { token } = antdTheme.useToken();
  const [logoUrl, setLogoUrl] = useState(null);
  const [logoError, setLogoError] = useState(false);
  const companyName = job.company?.name || 'Company';

  useEffect(() => {
    async function loadLogo() {
      let url = job.company?.logo || job.company?.logoUrl;
      if (!url && job.company?.logoKey) {
        url = `${process.env.NEXT_PUBLIC_STORAGE_URL || 'https://ap-southeast-mys1.oss.ips1cloud.com/job-finder-bucket'}/${job.company.logoKey}`;
      }

      if (url) {
        try {
          const res = await fetch(`${API_BASE_URL}/signed-url?url=${encodeURIComponent(url)}`);
          if (res.ok) {
            const data = await res.json();
            setLogoUrl(data.signedUrl);
          } else {
            setLogoUrl(url);
          }
        } catch (e) {
          setLogoUrl(url);
        }
      }
    }
    loadLogo();
  }, [job.company?.logo, job.company?.logoUrl, job.company?.logoKey]);

  if (logoUrl && !logoError) {
    return (
      <img
        src={logoUrl}
        alt={companyName}
        onError={() => setLogoError(true)}
        style={{
          width: size,
          height: size,
          borderRadius: 6,
          objectFit: 'cover',
          border: `1px solid ${token.colorBorder}`,
          flexShrink: 0
        }}
      />
    );
  }

  // Placeholder
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 6,
        backgroundColor: token.colorBgLayout,
        border: `1px solid ${token.colorBorder}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size / 2.5,
        fontWeight: 600,
        color: token.colorTextTertiary,
        flexShrink: 0
      }}
    >
      {companyName.charAt(0).toUpperCase()}
    </div>
  );
}

export default function SimilarJobs({ currentJob }) {
  const { token } = antdTheme.useToken();
  const [similarJobs, setSimilarJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log('SimilarJobs component rendered with currentJob:', currentJob);

  useEffect(() => {
    const fetchSimilarJobs = async () => {
      try {
        setLoading(true);

        // Simple query to get recent active jobs, excluding current job
        let queryParams = new URLSearchParams({
          status: 2, // Active jobs only
          $limit: 4,
          $sort: JSON.stringify({ createdAt: -1 })
        });

        // Exclude current job
        if (currentJob._id) {
          queryParams.append('_id[$ne]', currentJob._id);
        }

        console.log('Fetching similar jobs with URL:', `${API_BASE_URL}/job-listings?${queryParams}`);

        const response = await fetch(`${API_BASE_URL}/job-listings?${queryParams}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch similar jobs: ${response.status}`);
        }

        const data = await response.json();
        console.log('Similar jobs response:', data);
        setSimilarJobs(data.data || data || []);
      } catch (err) {
        console.error('Error fetching similar jobs:', err);

        // Fallback to sample data for demonstration
        const sampleJobs = [
          {
            _id: 'sample1',
            title: 'Software Developer Intern',
            company: { name: 'Tech Solutions', _id: 'company1' },
            location: { city: 'Kuala Lumpur', state: 'Selangor' },
            quantityAvailable: 2,
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
          },
          {
            _id: 'sample2',
            title: 'Marketing Intern',
            company: { name: 'Creative Agency', _id: 'company2' },
            location: { city: 'Petaling Jaya', state: 'Selangor' },
            quantityAvailable: 1,
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() // 10 days ago
          },
          {
            _id: 'sample3',
            title: 'Data Analyst Intern',
            company: { name: 'Analytics Corp', _id: 'company3' },
            location: { city: 'Cyberjaya', state: 'Selangor' },
            quantityAvailable: 3,
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() // 15 days ago
          }
        ];

        setSimilarJobs(sampleJobs);
        setError(null); // Clear error since we have fallback data
      } finally {
        setLoading(false);
      }
    };

    if (currentJob) {
      fetchSimilarJobs();
    }
  }, [currentJob]);



  if (loading) {
    return (
      <Card
        title="Similar Jobs"
        style={{
          marginBottom: 24,
          backgroundColor: token.colorBgContainer,
          border: `1px solid ${token.colorBorder}`
        }}
      >
        <div style={{ textAlign: 'center', padding: 20 }}>
          <Spin size="large" />
          <div style={{ marginTop: 8, color: token.colorText }}>Loading similar jobs...</div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card
        title="Similar Jobs"
        style={{
          marginBottom: 24,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          backgroundColor: token.colorBgContainer,
          border: `1px solid ${token.colorBorder}`
        }}
      >
        <Alert message="Unable to load similar jobs" type="warning" />
      </Card>
    );
  }

  return (
    <Card
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Find Similar Jobs!</span>
          <Link href="/jobs">
            <Text style={{ fontSize: 14, color: token.colorPrimary, cursor: 'pointer' }}>View all</Text>
          </Link>
        </div>
      }
      style={{
        marginBottom: 24,
        backgroundColor: token.colorBgContainer,
        border: `1px solid ${token.colorBorder}`
      }}
    >
      {similarJobs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 20 }}>
          <Text type="secondary">No similar jobs found</Text>
        </div>
      ) : (
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {similarJobs.slice(0, 3).map((job, index) => (
            <Link key={job._id} href={`/jobs/${job._id}`} style={{ textDecoration: 'none' }}>
              <div style={{
                padding: 16,
                border: `1px solid ${token.colorBorder}`,
                borderRadius: 8,
                backgroundColor: token.colorBgLayout,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = token.colorBgContainer;
                e.currentTarget.style.borderColor = token.colorPrimary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = token.colorBgLayout;
                e.currentTarget.style.borderColor = token.colorBorder;
              }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  {/* Company Logo with Placeholder */}
                  <JobLogo job={job} size={40} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text strong style={{
                      fontSize: 14,
                      display: 'block',
                      marginBottom: 4,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: token.colorText
                    }}>
                      {job.title}
                    </Text>
                    <Text style={{ fontSize: 12, color: token.colorPrimary, marginBottom: 8, display: 'block' }}>
                      {job.company?.name || 'Company'}
                    </Text>

                    {job.location && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <Text style={{ fontSize: 12, color: token.colorTextSecondary }}>
                          <EnvironmentOutlined style={{ marginRight: 4 }} />
                          {job.location.city}{job.location.state && `, ${job.location.state}`}
                        </Text>
                      </div>
                    )}

                    {job.quantityAvailable && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <Text style={{ fontSize: 12, color: token.colorTextSecondary }}>
                          <BankOutlined style={{ marginRight: 4 }} />
                          {job.quantityAvailable} position{job.quantityAvailable > 1 ? 's' : ''}
                        </Text>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontSize: 11, color: token.colorTextTertiary }}>
                        Posted {formatDate(job.createdAt)}
                      </Text>
                      <Text style={{
                        fontSize: 12,
                        color: token.colorPrimary,
                        backgroundColor: token.colorPrimaryBg,
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontWeight: 500
                      }}>
                        View Job
                      </Text>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </Space>
      )}
    </Card>
  );
}
