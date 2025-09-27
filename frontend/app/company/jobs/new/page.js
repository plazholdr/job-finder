"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Layout, Card, Steps, Form, Input, InputNumber, DatePicker, Select, Upload, Button, Space, Typography, message, Divider, Checkbox } from "antd";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import { API_BASE_URL } from "../../../../config";
import { useRouter } from "next/navigation";

const { Title, Text } = Typography;

export default function NewJobListingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState(null);
  const [current, setCurrent] = useState(0);

  // Forms per step
  const [form1] = Form.useForm();
  const [form2] = Form.useForm();
  const [form3] = Form.useForm();
  const [form4] = Form.useForm();

  const [generalDocs, setGeneralDocs] = useState([]);
  const [jobDocs, setJobDocs] = useState([]);

  const [draftId, setDraftId] = useState(null);

  // Gate: must be company and have a company record
  const loadCompany = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("jf_token");
      if (!token) {
        message.info("Please sign in");
        router.replace("/login");
        return;
      }
      const meRes = await fetch(`${API_BASE_URL}/users/me`, { headers: { Authorization: `Bearer ${token}` } });
      if (!meRes.ok) throw new Error("Failed to load user");
      const me = await meRes.json();
      const cRes = await fetch(`${API_BASE_URL}/companies?ownerUserId=${me._id}`, { headers: { Authorization: `Bearer ${token}` } });
      const cJson = await cRes.json();
      const list = Array.isArray(cJson?.data) ? cJson.data : [];
      if (!list.length) {
        message.info("Please complete your company setup first.");
        router.replace("/company/setup");
        return;
      }
      setCompany(list[0]);
    } catch (e) {
      message.error(e.message || "Failed to load company");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { loadCompany(); }, [loadCompany]);

  const uploadToServer = async (file, field) => {
    try {
      const token = localStorage.getItem("jf_token");
      const fd = new FormData();
      fd.append(field, file);
      const up = await fetch(`${API_BASE_URL}/upload`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
      if (!up.ok) throw new Error("Upload failed");
      const data = await up.json();
      const f = data?.files?.[field]?.[0];
      return { url: f?.url || f?.signedUrl, key: f?.key, name: file.name };
    } catch (e) {
      message.error(e.message || "Upload failed");
      return null;
    }
  };

  const handleUpload = (setter, field) => async (file) => {
    const meta = await uploadToServer(file, field);
    if (meta) setter((prev) => [...prev, meta]);
    return false;
  };

  const collectPayload = async () => {
    const v1 = await form1.validateFields().catch(() => null);
    const v2 = await form2.validateFields().catch(() => null);
    const v3 = await form3.validateFields().catch(() => null);
    const v4 = await form4.validateFields().catch(() => null);
    return { ...v1, ...v2, ...v3, ...v4 };
  };

  const saveDraft = async () => {
    try {
      const token = localStorage.getItem("jf_token");
      if (!token) return message.info("Please sign in");
      const vals = await collectPayload();
      const payload = {
        companyId: company?._id,
        // Listing details
        internshipStart: vals?.internshipStart ? vals.internshipStart.startOf('month').toISOString() : null,
        internshipEnd: vals?.internshipEnd ? vals.internshipEnd.startOf('month').toISOString() : null,
        position: vals?.position || 'intern',
        profession: vals?.profession || '',
        title: vals?.title || '',
        description: vals?.description || '',
        location: { city: vals?.city || '', state: vals?.state || '' },
        salaryRange: { min: vals?.salaryMin || 0, max: vals?.salaryMax || 0 },
        quantity: vals?.quantity || 1,
        picName: vals?.picName || '',
        picContact: vals?.picContact || '',
        // Project
        project: {
          title: vals?.projectTitle || '',
          description: vals?.projectDescription || '',
          start: vals?.projectStart ? vals.projectStart.startOf('month').toISOString() : null,
          end: vals?.projectEnd ? vals.projectEnd.startOf('month').toISOString() : null,
          locations: vals?.projectLocations || [],
          roleDescription: vals?.roleDescription || '',
          interests: [vals?.interest1, vals?.interest2, vals?.interest3].filter(Boolean),
        },
        // Onboarding materials
        onboarding: {
          generalDocs: generalDocs,
          jobSpecificDocs: jobDocs,
        },
        // Publish prefs
        instantOnApproval: !!vals?.instantOnApproval,
        publishAt: vals?.publishAt || null,
        // Status: 0=draft
        status: 0,
      };

      const res = await fetch(`${API_BASE_URL}/job-listings${draftId ? `/${draftId}` : ''}`, {
        method: draftId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save draft");
      const data = await res.json();
      if (!draftId) setDraftId(data?._id);
      message.success("Draft saved");
    } catch (e) {
      message.error(e.message || "Failed to save draft");
    }
  };

  const submitForApproval = async () => {
    try {
      const token = localStorage.getItem("jf_token");
      if (!token) return message.info("Please sign in");
      // Require all forms valid when submitting
      await form1.validateFields();
      await form2.validateFields();
      await form3.validateFields();
      await form4.validateFields();
      const vals = await collectPayload();
      const payload = {
        companyId: company?._id,
        internshipStart: vals?.internshipStart ? vals.internshipStart.startOf('month').toISOString() : null,
        internshipEnd: vals?.internshipEnd ? vals.internshipEnd.startOf('month').toISOString() : null,
        position: vals?.position || 'intern',
        profession: vals?.profession || '',
        title: vals?.title || '',
        description: vals?.description || '',
        location: { city: vals?.city || '', state: vals?.state || '' },
        salaryRange: { min: vals?.salaryMin || 0, max: vals?.salaryMax || 0 },
        quantity: vals?.quantity || 1,
        picName: vals?.picName || '',
        picContact: vals?.picContact || '',
        project: {
          title: vals?.projectTitle || '',
          description: vals?.projectDescription || '',
          start: vals?.projectStart ? vals.projectStart.startOf('month').toISOString() : null,
          end: vals?.projectEnd ? vals.projectEnd.startOf('month').toISOString() : null,
          locations: vals?.projectLocations || [],
          roleDescription: vals?.roleDescription || '',
          interests: [vals?.interest1, vals?.interest2, vals?.interest3].filter(Boolean),
        },
        onboarding: {
          generalDocs: generalDocs,
          jobSpecificDocs: jobDocs,
        },
        instantOnApproval: !!vals?.instantOnApproval,
        publishAt: vals?.publishAt || null,
        status: 1, // pending
      };

      const res = await fetch(`${API_BASE_URL}/job-listings${draftId ? `/${draftId}` : ''}`, {
        method: draftId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to submit for approval");
      message.success("Submitted for approval. Operator will approve within ~2 hours.");
      router.replace("/company/profile");
    } catch (e) {
      message.error(e.message || "Submission failed");
    }
  };

  const steps = [
    {
      title: "Job listing details",
      content: (
        <Form form={form1} layout="vertical">
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Space wrap>
              <Form.Item name="internshipStart" label="Internship start" rules={[{ required: true }]}>
                <DatePicker picker="month" format="MM/YY" />
              </Form.Item>
              <Form.Item name="internshipEnd" label="Internship end" rules={[{ required: true }]}>
                <DatePicker picker="month" format="MM/YY" />
              </Form.Item>
            </Space>
            <Space wrap>
              <Form.Item name="position" label="Position" initialValue="intern">
                <Select options={[{label:'Intern',value:'intern'},{label:'Contract',value:'contract'}]} style={{ width: 200 }} />
              </Form.Item>
              <Form.Item name="profession" label="Profession" rules={[{ required: true }]}>
                <Input placeholder="e.g., Software Engineering" />
              </Form.Item>
            </Space>
            <Form.Item name="title" label="Job title" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="description" label="Job description" rules={[{ required: true }] }>
              <Input.TextArea rows={6} />
            </Form.Item>
            <Space wrap>
              <Form.Item name="city" label="City" rules={[{ required: true }]}>
                <Input style={{ width: 200 }} />
              </Form.Item>
              <Form.Item name="state" label="State" rules={[{ required: true }]}>
                <Input style={{ width: 200 }} />
              </Form.Item>
            </Space>
            <Space wrap>
              <Form.Item name="salaryMin" label="Salary min" rules={[{ required: true }]}>
                <InputNumber min={0} step={50} />
              </Form.Item>
              <Form.Item name="salaryMax" label="Salary max" rules={[{ required: true }]}>
                <InputNumber min={0} step={50} />
              </Form.Item>
              <Form.Item name="quantity" label="Quantity available" rules={[{ required: true }]}>
                <InputNumber min={1} />
              </Form.Item>
            </Space>
            <Space wrap>
              <Form.Item name="picName" label="PIC name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="picContact" label="PIC contact" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Space>
          </Space>
        </Form>
      ),
    },
    {
      title: "Project details",
      content: (
        <Form form={form2} layout="vertical">
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Form.Item name="projectTitle" label="Project title" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="projectDescription" label="Project description" rules={[{ required: true }]}>
              <Input.TextArea rows={6} />
            </Form.Item>
            <Space wrap>
              <Form.Item name="projectStart" label="Project start" rules={[{ required: true }]}>
                <DatePicker picker="month" format="MM/YY" />
              </Form.Item>
              <Form.Item name="projectEnd" label="Project end" rules={[{ required: true }]}>
                <DatePicker picker="month" format="MM/YY" />
              </Form.Item>
            </Space>
            <Form.Item name="projectLocations" label="Project location (multiple)">
              <Select mode="tags" placeholder="Type and press enter" style={{ width: 480 }} />
            </Form.Item>
            <Form.Item name="roleDescription" label="Role description" rules={[{ required: true }]}>
              <Input.TextArea rows={4} />
            </Form.Item>
            <Space wrap>
              <Form.Item name="interest1" label="Area of interest 1">
                <Input style={{ width: 240 }} />
              </Form.Item>
              <Form.Item name="interest2" label="Area of interest 2">
                <Input style={{ width: 240 }} />
              </Form.Item>
              <Form.Item name="interest3" label="Area of interest 3">
                <Input style={{ width: 240 }} />
              </Form.Item>
            </Space>
          </Space>
        </Form>
      ),
    },
    {
      title: "Onboarding materials",
      content: (
        <Form form={form3} layout="vertical">
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <Text strong>General onboarding documents</Text>
              <Upload.Dragger multiple beforeUpload={handleUpload(setGeneralDocs, 'general')} showUploadList={false} style={{ marginTop: 8 }}>
                <p>Click or drag files to upload</p>
              </Upload.Dragger>
              {!!generalDocs.length && (<div style={{ marginTop: 8 }}>{generalDocs.map((d,i)=>(<div key={i}><a href={d.url} target="_blank" rel="noreferrer">{d.name || d.key}</a></div>))}</div>)}
            </div>
            <div>
              <Text strong>Job specific onboarding documents</Text>
              <Upload.Dragger multiple beforeUpload={handleUpload(setJobDocs, 'jobSpecific')} showUploadList={false} style={{ marginTop: 8 }}>
                <p>Click or drag files to upload</p>
              </Upload.Dragger>
              {!!jobDocs.length && (<div style={{ marginTop: 8 }}>{jobDocs.map((d,i)=>(<div key={i}><a href={d.url} target="_blank" rel="noreferrer">{d.name || d.key}</a></div>))}</div>)}
            </div>
          </Space>
        </Form>
      ),
    },
    {
      title: "Publish date",
      content: (
        <Form form={form4} layout="vertical">
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Form.Item name="instantOnApproval" valuePropName="checked">
              <Checkbox>Instant publish upon approval</Checkbox>
            </Form.Item>
            <Form.Item name="publishAt" label="Specific date/time upon approval (optional)">
              <DatePicker showTime style={{ width: 280 }} />
            </Form.Item>
          </Space>
        </Form>
      ),
    },
  ];

  const next = () => setCurrent((c) => Math.min(c + 1, steps.length - 1));
  const prev = () => setCurrent((c) => Math.max(c - 1, 0));

  return (
    <Layout>
      <Navbar />
      <Layout.Content style={{ maxWidth: 1200, margin: '24px auto', padding: '0 16px' }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Title level={3} style={{ margin: 0 }}>Create Job Listing</Title>
            <Space>
              <Button onClick={saveDraft} loading={loading}>Save as draft</Button>
              <Button type="primary" onClick={submitForApproval} loading={loading}>Submit for approval</Button>
            </Space>
          </div>
          <Steps current={current} items={steps.map(s=>({ title: s.title }))} style={{ marginBottom: 24 }} />
          <div style={{ paddingTop: 8 }}>{steps[current].content}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
            <Button disabled={current===0} onClick={prev}>Previous</Button>
            <Button disabled={current===steps.length-1} onClick={next}>Next</Button>
          </div>
        </Card>
      </Layout.Content>
      <Footer />
    </Layout>
  );
}

