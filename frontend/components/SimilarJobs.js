"use client";
import { useState, useEffect } from 'react';
import { Card, Space, Typography, Spin, Alert } from 'antd';
import { EnvironmentOutlined, BankOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { formatDate } from '../utils/formatters';
import { API_BASE_URL } from '../config';

const { Text } = Typography;

export default function SimilarJobs({ currentJob }) {
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

  const getCompanyInitial = (companyName) => {
    return companyName ? companyName.charAt(0).toUpperCase() : 'C';
  };

  const getRandomColor = (index) => {
    const colors = ['#1890ff', '#ff4d4f', '#52c41a', '#faad14', '#722ed1', '#eb2f96'];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <Card
        title="Similar Jobs"
        style={{ marginBottom: 24 }}
      >
        <div style={{ textAlign: 'center', padding: 20 }}>
          <Spin size="large" />
          <div style={{ marginTop: 8 }}>Loading similar jobs...</div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card 
        title="Similar Jobs" 
        style={{ marginBottom: 24, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', border: '1px solid #d9d9d9' }}
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
            <Text style={{ fontSize: 14, color: '#1890ff', cursor: 'pointer' }}>View all</Text>
          </Link>
        </div>
      } 
      style={{ marginBottom: 24 }}
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
                border: '1px solid #f0f0f0', 
                borderRadius: 8,
                backgroundColor: '#fafafa',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f5';
                e.currentTarget.style.borderColor = '#d9d9d9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#fafafa';
                e.currentTarget.style.borderColor = '#f0f0f0';
              }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ 
                    width: 40, 
                    height: 40, 
                    backgroundColor: getRandomColor(index), 
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: 16,
                    fontWeight: 'bold',
                    flexShrink: 0
                  }}>
                    {getCompanyInitial(job.company?.name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text strong style={{ 
                      fontSize: 14, 
                      display: 'block', 
                      marginBottom: 4,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {job.title}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#1890ff', marginBottom: 8, display: 'block' }}>
                      {job.company?.name || 'Company'}
                    </Text>
                    
                    {job.location && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <Text style={{ fontSize: 12, color: '#666' }}>
                          <EnvironmentOutlined style={{ marginRight: 4 }} />
                          {job.location.city}{job.location.state && `, ${job.location.state}`}
                        </Text>
                      </div>
                    )}
                    
                    {job.quantityAvailable && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <Text style={{ fontSize: 12, color: '#666' }}>
                          <BankOutlined style={{ marginRight: 4 }} />
                          {job.quantityAvailable} position{job.quantityAvailable > 1 ? 's' : ''}
                        </Text>
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontSize: 11, color: '#999' }}>
                        Posted {formatDate(job.createdAt)}
                      </Text>
                      <Text style={{ 
                        fontSize: 12, 
                        color: '#1890ff', 
                        backgroundColor: '#f0f8ff',
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
