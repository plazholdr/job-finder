"use client";

import { useEffect, useMemo, useState } from 'react';
import { Card, Layout, Typography, Steps, Form, DatePicker, Input, Button, Space, Descriptions, List, Tag, App, message } from 'antd';
import Navbar from './Navbar';
import Footer from './Footer';
import { API_BASE_URL } from '../config';

const { Title, Paragraph, Text } = Typography;

export default function ApplyJobClient({ jobId }) {
  const [job, setJob] = useState(null);
  const [profile, setProfile] = useState(null); // { profile, internProfile }
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const { message } = App.useApp();

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('jf_token');
        if (!token) { window.location.href = `/login?next=/jobs/${jobId}/apply`; return; }
        const [jobRes, profRes] = await Promise.all([
          fetch(`${API_BASE_URL}/job-listings/${jobId}`),
          fetch(`${API_BASE_URL}/student/internship/me`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        if (jobRes.ok) setJob(await jobRes.json());
        if (profRes.ok) setProfile(await profRes.json());
        // default validity = +14 days
        const in14 = new Date(Date.now() + 14*24*60*60*1000);
        form.setFieldsValue({
          validityUntil: in14,
        });
      } catch (_) {}
    })();
  }, [jobId, form]);

  async function submit() {
    try {
      const v = await form.validateFields();
      setSubmitting(true);
      const token = localStorage.getItem('jf_token');

      const personalInfo = profile?.profile || {};
      const intern = profile?.internProfile || {};
      const internshipInfo = intern?.preferences || {};
      const courseInfo = Array.isArray(intern?.courses) ? intern.courses : [];
      const assignmentInfo = Array.isArray(intern?.assignments) ? intern.assignments : [];

      const payload = {
        jobListingId: jobId,
        candidateStatement: v.candidateStatement || '',
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
      if (!res.ok) { const t = await res.text(); throw new Error(t || 'Failed to submit application'); }
      message.success('Application submitted');
      window.location.href = '/applications';
    } catch (e) {
      if (e?.errorFields) return; // antd validation
      message.error(e.message || 'Submit failed');
    } finally { setSubmitting(false); }
  }

  function Summary() {
    const p = profile?.profile || {};
    const intern = profile?.internProfile || {};
    const pref = intern?.preferences || {};
    return (
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Descriptions title="Personal information" bordered column={1} size="small">
          <Descriptions.Item label="Full name">{[p.firstName, p.lastName].filter(Boolean).join(' ') || '-'}</Descriptions.Item>
          <Descriptions.Item label="Email">{p.email || '-'}</Descriptions.Item>
          <Descriptions.Item label="Phone">{p.phone || '-'}</Descriptions.Item>
          <Descriptions.Item label="Location">{p.location || '-'}</Descriptions.Item>
        </Descriptions>
        <Descriptions title="Internship details" bordered column={1} size="small">
          <Descriptions.Item label="Preferred dates">{pref.preferredStartDate || pref.startDate ? `${new Date(pref.preferredStartDate||pref.startDate).toLocaleDateString()} - ${pref.preferredEndDate||pref.endDate ? new Date(pref.preferredEndDate||pref.endDate).toLocaleDateString() : '-'}` : '-'}</Descriptions.Item>
          <Descriptions.Item label="Industries">{Array.isArray(pref.industries) ? pref.industries.join(', ') : (pref.industry || '-')}</Descriptions.Item>
          <Descriptions.Item label="Locations">{Array.isArray(pref.locations) ? pref.locations.join(', ') : '-'}</Descriptions.Item>
          <Descriptions.Item label="Salary range">{pref.salaryRange ? `RM ${pref.salaryRange.min ?? 0}${pref.salaryRange.max ? ' - RM ' + pref.salaryRange.max : ''}` : '-'}</Descriptions.Item>
        </Descriptions>
        {Array.isArray(intern.courses) && (
          <Card size="small" title="Course information">
            <List
              dataSource={intern.courses}
              renderItem={(c, idx) => (
                <List.Item key={idx}>
                  <Space direction="vertical">
                    <Text strong>{c.courseName || c.name || c.courseId || 'Course'}</Text>
                    {c.courseDescription || c.description ? <Text type="secondary">{c.courseDescription || c.description}</Text> : null}
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        )}
        {Array.isArray(intern.assignments) && (
          <Card size="small" title="Assignment information">
            <List
              dataSource={intern.assignments}
              renderItem={(a, idx) => (
                <List.Item key={idx}>
                  <Space direction="vertical">
                    <Text strong>{a.title || 'Assignment'}</Text>
                    <Text>Nature: {a.natureOfAssignment || a.nature || '-'}</Text>
                    {a.methodology && <Text>Methodology: {a.methodology}</Text>}
                    {a.description && <Text type="secondary">{a.description}</Text>}
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        )}
      </Space>
    );
  }

  return (
    <Layout>
      <Navbar />
      <Layout.Content style={{ padding: 24, maxWidth: 960, margin: '0 auto' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Title level={3} style={{ margin: 0 }}>Apply for {job?.title || 'Internship'}</Title>
          <Steps current={step} items={[{ title: 'Details' }, { title: 'Confirm' }]} />

          {step === 0 && (
            <Card>
              <Form layout="vertical" form={form} onFinish={() => setStep(1)}>
                <Form.Item label="Candidate Statement" name="candidateStatement" rules={[{ required: true, message: 'Please write a brief statement' }]}> 
                  <Input.TextArea rows={4} placeholder="Tell the company why you are a good fit" />
                </Form.Item>
                <Form.Item label="Application Validity (last date company can respond)" name="validityUntil" rules={[{ required: true, message: 'Please select validity date' }]}>
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item style={{ textAlign: 'right' }}>
                  <Space>
                    <Button onClick={() => history.back()}>Cancel</Button>
                    <Button type="primary" htmlType="submit">Next</Button>
                  </Space>
                </Form.Item>
              </Form>
            </Card>
          )}

          {step === 1 && (
            <Card>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Title level={5} style={{ margin: 0 }}>Confirm your details</Title>
                <Summary />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Button onClick={() => setStep(0)}>Back</Button>
                  <Button type="primary" loading={submitting} onClick={submit}>Submit application</Button>
                </div>
              </Space>
            </Card>
          )}
        </Space>
      </Layout.Content>
      <Footer />
    </Layout>
  );
}

