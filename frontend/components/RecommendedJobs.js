"use client";
import { useState, useEffect } from 'react';
import { Card, Space, Typography, Spin, Avatar, theme as antdTheme } from 'antd';
import { EnvironmentOutlined, BankOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { formatDate } from '../utils/formatters';
import { API_BASE_URL } from '../config';

const { Text } = Typography;

export default function RecommendedJobs({ user }) {
  const { token } = antdTheme.useToken();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logoUrls, setLogoUrls] = useState({});

  useEffect(() => {
    const fetchRecommendedJobs = async () => {
      try {
        setLoading(true);

        // Build query based on user preferences
        let queryParams = new URLSearchParams({
          status: 2, // Active jobs only
          $limit: 5,
          $sort: JSON.stringify({ createdAt: -1 })
        });

        // Add filters based on user's internProfile preferences
        const preferences = user?.internProfile?.preferences;
        
        // Filter by preferred industries if available
        if (preferences?.industries && preferences.industries.length > 0) {
          // Note: This might need backend support for $in operator
          queryParams.append('industry', preferences.industries[0]);
        }

        const response = await fetch(`${API_BASE_URL}/job-listings?${queryParams}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch jobs: ${response.status}`);
        }

        const data = await response.json();
        const jobsList = data.data || data || [];
        setJobs(jobsList);

        // Load logos for all jobs
        loadLogos(jobsList);
      } catch (err) {
        console.error('Error fetching recommended jobs:', err);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchRecommendedJobs();
    }
  }, [user]);

  const loadLogos = async (jobsList) => {
    const urls = {};
    for (const job of jobsList) {
      let logoUrl = job.company?.logo || job.company?.logoUrl || job.companyLogo;
      if (!logoUrl && job.company?.logoKey) {
        logoUrl = `${process.env.NEXT_PUBLIC_STORAGE_URL || 'https://ap-southeast-mys1.oss.ips1cloud.com/job-finder-bucket'}/${job.company.logoKey}`;
      }

      if (logoUrl) {
        try {
          const res = await fetch(`${API_BASE_URL}/signed-url?url=${encodeURIComponent(logoUrl)}`);
          if (res.ok) {
            const data = await res.json();
            urls[job._id] = data.signedUrl;
          } else {
            urls[job._id] = logoUrl;
          }
        } catch (e) {
          urls[job._id] = logoUrl;
        }
      }
    }
    setLogoUrls(urls);
  };

  const getCompanyInitial = (companyName) => {
    return companyName ? companyName.charAt(0).toUpperCase() : 'C';
  };

  if (loading) {
    return (
      <Card
        title="Recommended for You"
        style={{
          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.08)",
          border: `1px solid ${token.colorBorder}`,
          borderRadius: 8,
          backgroundColor: token.colorBgContainer
        }}
      >
        <div style={{ textAlign: 'center', padding: 20 }}>
          <Spin size="large" />
          <div style={{ marginTop: 8, color: token.colorText }}>Loading recommendations...</div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Recommended for You</span>
          <Link href="/jobs">
            <Text style={{ fontSize: 14, color: token.colorPrimary, cursor: 'pointer' }}>View all</Text>
          </Link>
        </div>
      }
      style={{
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.08)",
        border: `1px solid ${token.colorBorder}`,
        borderRadius: 8,
        backgroundColor: token.colorBgContainer
      }}
    >
      {jobs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 20 }}>
          <Text type="secondary">No recommendations available</Text>
        </div>
      ) : (
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {jobs.slice(0, 5).map((job, index) => (
            <Link key={job._id} href={`/jobs/${job._id}`} style={{ textDecoration: 'none' }}>
              <div style={{
                padding: 12,
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
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  {/* Company Logo */}
                  <Avatar
                    size={40}
                    src={logoUrls[job._id]}
                    icon={<BankOutlined />}
                    style={{
                      backgroundColor: logoUrls[job._id] ? 'transparent' : token.colorBgLayout,
                      color: token.colorTextTertiary,
                      border: `1px solid ${token.colorBorder}`,
                      flexShrink: 0
                    }}
                  />

                  {/* Job Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text strong style={{
                      fontSize: 14,
                      display: 'block',
                      color: token.colorText,
                      marginBottom: 4,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {job.title}
                    </Text>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                      <BankOutlined style={{ fontSize: 12, color: token.colorTextSecondary }} />
                      <Text style={{ fontSize: 12, color: token.colorTextSecondary }}>
                        {job.company?.name || job.companyName || 'Company'}
                      </Text>
                    </div>

                    {job.location && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <EnvironmentOutlined style={{ fontSize: 12, color: token.colorTextSecondary }} />
                        <Text style={{ fontSize: 12, color: token.colorTextSecondary }}>
                          {job.location.city}{job.location.state && `, ${job.location.state}`}
                        </Text>
                      </div>
                    )}
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

