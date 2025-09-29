"use client";

import { useEffect, useMemo, useState } from 'react';
import { Card, Layout, Typography, Steps, Form, DatePicker, Input, Button, Space, Descriptions, List, Tag, App, message, Alert, Spin, Row, Col, Divider } from 'antd';
import { CalendarOutlined, UserOutlined, BookOutlined, FileTextOutlined, CheckCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import Navbar from './Navbar';
import Footer from './Footer';
import { API_BASE_URL } from '../config';

const { Title, Paragraph, Text } = Typography;

export default function ApplyJobClient({ jobId }) {
  const [job, setJob] = useState(null);
  const [profile, setProfile] = useState(null); // { profile, internProfile }
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form] = Form.useForm();
  const { message } = App.useApp();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('jf_token');
        if (!token) {
          window.location.href = `/login?next=/jobs/${jobId}/apply`;
          return;
        }

        const [jobRes, profRes] = await Promise.all([
          fetch(`${API_BASE_URL}/job-listings/${jobId}`),
          fetch(`${API_BASE_URL}/student/internship/me`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (!jobRes.ok) {
          throw new Error('Job not found or no longer available');
        }

        const jobData = await jobRes.json();
        setJob(jobData);

        if (profRes.ok) {
          setProfile(await profRes.json());
        } else {
          setError('Please complete your student profile before applying');
          return;
        }

        // Default validity = +14 days
        const in14 = dayjs().add(14, 'day');
        form.setFieldsValue({
          validityUntil: in14,
        });
      } catch (err) {
        setError(err.message || 'Failed to load application data');
      } finally {
        setLoading(false);
      }
    })();
  }, [jobId, form]);

  async function submit() {
    try {
      const v = await form.validateFields();
      setSubmitting(true);
      const token = localStorage.getItem('jf_token');

      if (!token) {
        message.error('Please sign in to submit your application');
        window.location.href = `/login?next=/jobs/${jobId}/apply`;
        return;
      }

      const personalInfo = profile?.profile || {};
      const intern = profile?.internProfile || {};
      const internshipInfo = intern?.preferences || {};
      const courseInfo = Array.isArray(intern?.courses) ? intern.courses : [];
      const assignmentInfo = Array.isArray(intern?.assignments) ? intern.assignments : [];

      const payload = {
        jobListingId: jobId,
        candidateStatement: v.candidateStatement?.trim() || '',
        validityUntil: v.validityUntil ? new Date(v.validityUntil) : undefined,
        form: {
          personalInfo,
          internshipInfo,
          courseInfo,
          assignmentInfo
        }
      };

      const res = await fetch(`${API_BASE_URL}/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        let errorMessage = 'Failed to submit application';
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          const errorText = await res.text();
          if (errorText) errorMessage = errorText;
        }

        if (res.status === 409) {
          errorMessage = 'You have already applied for this position';
        } else if (res.status === 403) {
          errorMessage = 'You are not authorized to apply for this position';
        } else if (res.status === 404) {
          errorMessage = 'This job position is no longer available';
        }

        throw new Error(errorMessage);
      }

      message.success({
        content: 'Application submitted successfully! You will be redirected to your applications page.',
        duration: 3
      });

      // Redirect after a short delay to show the success message
      setTimeout(() => {
        window.location.href = '/applications';
      }, 1500);

    } catch (e) {
      if (e?.errorFields) return; // antd validation errors
      console.error('Application submission error:', e);
      message.error(e.message || 'Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function Summary() {
    const p = profile?.profile || {};
    const intern = profile?.internProfile || {};
    const pref = intern?.preferences || {};
    const formValues = form.getFieldsValue();

    return (
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Application Details */}
        <Card size="small" title={<><FileTextOutlined /> Application Details</>}>
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Candidate Statement">
              <div style={{
                padding: 12,
                backgroundColor: '#f8f9fa',
                borderRadius: 6,
                border: '1px solid #e9ecef',
                whiteSpace: 'pre-wrap'
              }}>
                {formValues.candidateStatement || 'No statement provided'}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Application Valid Until">
              <Text strong>
                {formValues.validityUntil
                  ? new Date(formValues.validityUntil).toLocaleDateString('en-MY', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : 'Not specified'
                }
              </Text>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Personal Information */}
        <Card size="small" title={<><UserOutlined /> Personal Information</>}>
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Full Name">
              <Text strong>{[p.firstName, p.lastName].filter(Boolean).join(' ') || 'Not provided'}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              <Text copyable>{p.email || 'Not provided'}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Phone">
              <Text>{p.phone || 'Not provided'}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Location">
              <Text>{p.location || 'Not provided'}</Text>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Internship Preferences */}
        <Card size="small" title={<><CalendarOutlined /> Internship Preferences</>}>
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Preferred Duration">
              {pref.preferredStartDate || pref.startDate ? (
                <Text>
                  {new Date(pref.preferredStartDate || pref.startDate).toLocaleDateString()} - {' '}
                  {pref.preferredEndDate || pref.endDate
                    ? new Date(pref.preferredEndDate || pref.endDate).toLocaleDateString()
                    : 'Open-ended'
                  }
                </Text>
              ) : (
                <Text type="secondary">Not specified</Text>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Preferred Industries">
              {Array.isArray(pref.industries) && pref.industries.length > 0 ? (
                <Space wrap>
                  {pref.industries.map((industry, idx) => (
                    <Tag key={idx} color="blue">{industry}</Tag>
                  ))}
                </Space>
              ) : (
                <Text type="secondary">{pref.industry || 'Not specified'}</Text>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Preferred Locations">
              {Array.isArray(pref.locations) && pref.locations.length > 0 ? (
                <Space wrap>
                  {pref.locations.map((location, idx) => (
                    <Tag key={idx} color="green">{location}</Tag>
                  ))}
                </Space>
              ) : (
                <Text type="secondary">Not specified</Text>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Expected Salary Range">
              {pref.salaryRange ? (
                <Text strong>
                  RM {pref.salaryRange.min ?? 0}
                  {pref.salaryRange.max ? ` - RM ${pref.salaryRange.max}` : '+'}
                </Text>
              ) : (
                <Text type="secondary">Not specified</Text>
              )}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Course Information */}
        {Array.isArray(intern.courses) && intern.courses.length > 0 && (
          <Card size="small" title={<><BookOutlined /> Course Information</>}>
            <List
              dataSource={intern.courses}
              renderItem={(c, idx) => (
                <List.Item key={idx}>
                  <List.Item.Meta
                    title={<Text strong>{c.courseName || c.name || c.courseId || 'Course'}</Text>}
                    description={c.courseDescription || c.description || 'No description provided'}
                  />
                </List.Item>
              )}
            />
          </Card>
        )}

        {/* Assignment Information */}
        {Array.isArray(intern.assignments) && intern.assignments.length > 0 && (
          <Card size="small" title={<><FileTextOutlined /> Assignment Information</>}>
            <List
              dataSource={intern.assignments}
              renderItem={(a, idx) => (
                <List.Item key={idx}>
                  <List.Item.Meta
                    title={<Text strong>{a.title || 'Assignment'}</Text>}
                    description={
                      <Space direction="vertical" size="small">
                        <Text><strong>Nature:</strong> {a.natureOfAssignment || a.nature || 'Not specified'}</Text>
                        {a.methodology && <Text><strong>Methodology:</strong> {a.methodology}</Text>}
                        {a.description && <Text type="secondary">{a.description}</Text>}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        )}

        {/* Warning if profile incomplete */}
        {(!p.firstName || !p.lastName || !p.email) && (
          <Alert
            message="Incomplete Profile"
            description="Some personal information is missing. Consider updating your profile to improve your application."
            type="warning"
            showIcon
          />
        )}
      </Space>
    );
  }

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Navbar />
        <Layout.Content style={{ padding: 24, maxWidth: 960, margin: '0 auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Spin size="large" />
        </Layout.Content>
        <Footer />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Navbar />
        <Layout.Content style={{ padding: 24, maxWidth: 960, margin: '0 auto' }}>
          <Alert
            message="Unable to Load Application"
            description={error}
            type="error"
            showIcon
            action={
              <Button size="small" onClick={() => window.history.back()}>
                Go Back
              </Button>
            }
          />
        </Layout.Content>
        <Footer />
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Navbar />
      <Layout.Content style={{ padding: 24, maxWidth: 960, margin: '0 auto' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Header */}
          <div>
            <Title level={2} style={{ margin: 0, marginBottom: 8 }}>
              Apply for {job?.title}
            </Title>
            {job?.company && (
              <Text type="secondary" style={{ fontSize: 16 }}>
                at {job.company.name}
              </Text>
            )}
          </div>

          {/* Progress Steps */}
          <Steps
            current={step}
            items={[
              { title: 'Application Details', icon: <FileTextOutlined /> },
              { title: 'Review & Submit', icon: <CheckCircleOutlined /> }
            ]}
          />

          {/* Job Summary Card */}
          {job && (
            <Card size="small" style={{ backgroundColor: '#f8f9fa' }}>
              <Row gutter={[16, 8]}>
                <Col span={24}>
                  <Text strong style={{ fontSize: 16 }}>{job.title}</Text>
                </Col>
                <Col xs={24} sm={12}>
                  <Text type="secondary">
                    <CalendarOutlined /> {job.location?.city}{job.location?.state && `, ${job.location.state}`}
                  </Text>
                </Col>
                <Col xs={24} sm={12}>
                  <Text type="secondary">
                    Duration: {job.project?.startDate && job.project?.endDate
                      ? `${new Date(job.project.startDate).toLocaleDateString()} - ${new Date(job.project.endDate).toLocaleDateString()}`
                      : 'Not specified'
                    }
                  </Text>
                </Col>
              </Row>
            </Card>
          )}

          {/* Step 1: Application Details */}
          {step === 0 && (
            <Card>
              <Title level={4} style={{ marginBottom: 16 }}>
                <FileTextOutlined /> Application Details
              </Title>

              <Alert
                message="Application Guidelines"
                description="Your application will be reviewed by the company. Make sure to provide a compelling statement about why you're interested in this position."
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
              />

              <Form layout="vertical" form={form} onFinish={() => setStep(1)}>
                <Form.Item
                  label="Candidate Statement"
                  name="candidateStatement"
                  rules={[
                    { required: true, message: 'Please write a brief statement' },
                    { min: 50, message: 'Please write at least 50 characters' },
                    { max: 1000, message: 'Please keep it under 1000 characters' }
                  ]}
                  extra="Tell the company why you are interested in this position and what makes you a good fit."
                >
                  <Input.TextArea
                    rows={6}
                    placeholder="Example: I am excited about this internship opportunity because..."
                    showCount
                    maxLength={1000}
                  />
                </Form.Item>

                <Form.Item
                  label="Application Validity"
                  name="validityUntil"
                  rules={[{ required: true, message: 'Please select validity date' }]}
                  extra="The last date the company can respond to your application. After this date, the application will be automatically withdrawn."
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    disabledDate={(current) => current && current.valueOf() < Date.now() + 24*60*60*1000}
                    placeholder="Select validity date"
                  />
                </Form.Item>

                <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
                  <Space>
                    <Button onClick={() => window.history.back()}>Cancel</Button>
                    <Button type="primary" htmlType="submit" icon={<CheckCircleOutlined />}>
                      Review Application
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Card>
          )}

          {/* Step 2: Review & Submit */}
          {step === 1 && (
            <Card>
              <Title level={4} style={{ marginBottom: 16 }}>
                <CheckCircleOutlined /> Review Your Application
              </Title>

              <Alert
                message="Review Before Submitting"
                description="Please review all your information carefully. Once submitted, you cannot edit your application."
                type="warning"
                showIcon
                style={{ marginBottom: 24 }}
              />

              <Summary />

              <Divider />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button onClick={() => setStep(0)} icon={<FileTextOutlined />}>
                  Back to Edit
                </Button>
                <Button
                  type="primary"
                  size="large"
                  loading={submitting}
                  onClick={submit}
                  icon={<CheckCircleOutlined />}
                >
                  Submit Application
                </Button>
              </div>
            </Card>
          )}
        </Space>
      </Layout.Content>
      <Footer />
    </Layout>
  );
}

