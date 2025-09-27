"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Layout,
  Card,
  Typography,
  Button,
  Space,
  Row,
  Col,
  Tabs,
  Tag,
  Form,
  Input,
  Upload,
  message,
  Avatar,
  Segmented,
  Skeleton,
  Empty,
  Pagination,
} from "antd";
import {
  EditOutlined,
  UploadOutlined,
  GlobalOutlined,
  EnvironmentOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import JobCard from "../../../components/JobCard";
import Link from "next/link";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { API_BASE_URL } from "../../../config";

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function CompanyProfilePage() {
  // Align with ProfilePageInner.js structure/state
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form] = Form.useForm();
  const [jobsView, setJobsView] = useState("list");
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [total, setTotal] = useState(0);

  const storageBase =
    process.env.NEXT_PUBLIC_STORAGE_URL ||
    "https://job-finder-storage.s3.ap-southeast-1.amazonaws.com";

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("jf_token");
      if (!token) {
        message.info("Please sign in");
        window.location.href = "/login";
        return;
      }

      // Current user (company owner)
      const meRes = await fetch(`${API_BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!meRes.ok) throw new Error("Failed to load user");
      const meJson = await meRes.json();

      // Company by owner
      const cRes = await fetch(
        `${API_BASE_URL}/companies?ownerUserId=${meJson._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!cRes.ok) throw new Error("Failed to load company");
      const cJson = await cRes.json();
      const list = Array.isArray(cJson?.data) ? cJson.data : [];
      if (list.length === 0) {
        message.info("Please complete your company setup first.");
        window.location.href = "/company/setup";
        return;
      }
      setCompany(list[0]);
      setEditing(false);
    } catch (e) {
      console.error(e);
      message.error(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);


  // Load jobs for this company
  useEffect(() => {
    let aborted = false;
    async function fetchJobs() {
      if (!company?._id) return;
      try {
        setJobsLoading(true);
        const token = localStorage.getItem("jf_token");
        const skip = (page - 1) * pageSize;
        const res = await fetch(`${API_BASE_URL}/job-listings?companyId=${company._id}&$limit=${pageSize}&$skip=${skip}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const items = Array.isArray(data) ? data : (data?.data || []);
        const t = data?.total ?? items.length;
        if (!aborted) { setJobs(items); setTotal(t); }
      } catch (e) {
        if (!aborted) { setJobs([]); setTotal(0); }
      } finally {
        if (!aborted) setJobsLoading(false);
      }
    }
    fetchJobs();
    return () => { aborted = true; };
  }, [company?._id, page]);

  useEffect(() => {
    load();
  }, [load]);

  const logoUrl = company?.logoKey
    ? `${storageBase}/${company.logoKey}`
    : company?.logo || null;

  async function onUploadLogo(file) {
    try {
      const token = localStorage.getItem("jf_token");
      const fd = new FormData();
      fd.append("logo", file);
      message.loading("Uploading logo...", 0);
      const up = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!up.ok) throw new Error("Upload failed");
      const data = await up.json();
      const url = data?.files?.logo?.[0]?.url || data?.files?.logo?.[0]?.signedUrl;
      const key = data?.files?.logo?.[0]?.key;
      if (url || key) {
        const res = await fetch(`${API_BASE_URL}/companies/${company._id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ logo: url, logoKey: key }),
        });
        if (!res.ok) throw new Error("Failed to save logo");
        message.destroy();
        message.success("Logo updated!");
        await load();
      }
    } catch (e) {
      message.destroy();
      message.error(e.message || "Logo upload failed");
    }
    return false; // prevent auto upload
  }

  async function onSave(values) {
    try {
      const token = localStorage.getItem("jf_token");
      const body = {
        name: values.name,
        industry: values.industry,
        website: values.website,
        description: values.description,
        email: values.email,
        phone: values.phone,
        address: {
          fullAddress: values.fullAddress,
        },
      };
      const res = await fetch(`${API_BASE_URL}/companies/${company._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to update company");
      message.success("Company updated");
      await load();
      setEditing(false);
    } catch (e) {
      message.error(e.message || "Update failed");
    }
  }

  const ViewLayout = () => {
    const statusText =
      company?.verifiedStatus === 1
        ? "Approved"
        : company?.verifiedStatus === 2
        ? "Rejected"
        : "Pending";
    const statusColor =
      company?.verifiedStatus === 1
        ? "green"
        : company?.verifiedStatus === 2
        ? "red"
        : "orange";

    const tabItems = [
      {
        key: "overview",
        label: "Company overview",
        children: (
          <div style={{ padding: "16px 0" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Title level={4} style={{ margin: 0 }}>
                Company overview
              </Title>
              <Button type="text" icon={<EditOutlined />} onClick={() => setEditing(true)} />
            </div>
            <Text style={{ fontSize: 16, lineHeight: 1.6 }}>
              {company?.description || "No description provided yet."}
            </Text>
          </div>
        ),
      },
    ];

    return (
      <Row gutter={24}>
        {/* Left Sidebar */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Card style={{ textAlign: "center", position: "relative" }}>
              <div style={{ position: "absolute", top: 16, right: 16 }}>
                <Tag color={statusColor} style={{ borderRadius: 12 }}>
                  {statusText}
                </Tag>
              </div>

              <div style={{ position: "relative", display: "inline-block", marginBottom: 16 }}>
                <Avatar size={80} src={logoUrl}>
                  {company?.name?.charAt(0) || "C"}
                </Avatar>
                <Upload beforeUpload={onUploadLogo} maxCount={1} accept="image/*" showUploadList={false}>
                  <Button
                    type="primary"
                    size="small"
                    icon={<UploadOutlined />}
                    style={{ position: "absolute", bottom: -5, right: -5, borderRadius: "50%" }}
                  />
                </Upload>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}>
                <Title level={4} style={{ margin: 0 }}>
                  {company?.name}
                </Title>
                <Button type="text" icon={<EditOutlined />} size="small" onClick={() => setEditing(true)} />
              </div>
              <Text style={{ fontSize: 16, fontWeight: 500, display: "block", marginBottom: 16 }}>
                {company?.industry || "Company industry"}
              </Text>
            </Card>

            {/* Company Details (moved from tabs) */}
            <Card title="Company details">
              <div style={{ marginBottom: 12 }}>
                <Text strong>Industry:</Text> <Text>{company?.industry || "\u2014"}</Text>
              </div>
              <div style={{ marginBottom: 12 }}>
                <GlobalOutlined />
                <a
                  href={company?.website || "#"}
                  target="_blank"
                  rel="noreferrer"
                  style={{ marginLeft: 8 }}
                >
                  {company?.website || "Website not set"}
                </a>
              </div>
              <div style={{ marginBottom: 12 }}>
                <MailOutlined />
                <Text style={{ marginLeft: 8 }}>{company?.email || "\u2014"}</Text>
              </div>
              <div style={{ marginBottom: 12 }}>
                <PhoneOutlined />
                <Text style={{ marginLeft: 8 }}>{company?.phone || "\u2014"}</Text>
              </div>
              <div style={{ marginBottom: 0 }}>
                <EnvironmentOutlined />
                <Text style={{ marginLeft: 8 }}>
                  {company?.address?.fullAddress || "Address not set"}
                </Text>
              </div>
            </Card>

            {/* Pending action */}
            <Card title="Pending action">
              <Space direction="vertical" style={{ width: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
                  <Text>Upload company logo</Text>
                  <Button type="text" size="small">›</Button>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
                  <Text>Add company website</Text>
                  <Button type="text" size="small">›</Button>
                </div>
              </Space>
            </Card>
          </Space>
        </Col>

        {/* Right Content */}
        <Col xs={24} lg={16}>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Card style={{ minHeight: 600 }}>
              <Tabs defaultActiveKey="overview" items={tabItems} tabBarStyle={{ marginBottom: 0 }} />
            </Card>

            <Card
              title="Job listings"
              extra={
                <Space size={8}>
                  <Segmented
                    size="small"
                    options={[
                      { label: "List", value: "list" },
                      { label: "Grid", value: "grid" },
                    ]}
                    value={jobsView}
                    onChange={(val) => setJobsView(val)}
                  />
                  {company?._id && (
                    <Link href={`/companies/${company._id}`}>
                      <Button type="link" size="small">View all</Button>
                    </Link>
                  )}
                </Space>
              }
            >
              {jobsLoading ? (
                <Skeleton active />
              ) : jobs.length ? (
                <>
                  {jobsView === "grid" ? (
                    <Row gutter={[16,16]}>
                      {jobs.map(j => (
                        <Col xs={24} sm={12} md={8} lg={6} key={j._id}>
                          <JobCard job={j} />
                        </Col>
                      ))}
                    </Row>
                  ) : (
                    <Row gutter={[16,16]}>
                      {jobs.map(j => (
                        <Col xs={24} key={j._id}>
                          <JobCard job={j} />
                        </Col>
                      ))}
                    </Row>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
                    <Pagination current={page} pageSize={pageSize} total={total} showSizeChanger={false} onChange={(p)=> setPage(p)} />
                  </div>
                </>
              ) : (
                <Empty description="No jobs yet" />
              )}
            </Card>
          </Space>
        </Col>
      </Row>
    );
  };

  if (loading) {
    return (
      <Layout>
        <Navbar />
        <Layout.Content style={{ maxWidth: 1400, margin: "24px auto", padding: "0 16px" }}>
          <Card loading style={{ minHeight: 400 }} />
        </Layout.Content>
        <Footer />
      </Layout>
    );
  }

  return (
    <Layout>
      <Navbar />
      <Layout.Content style={{ maxWidth: 1400, margin: "24px auto", padding: "0 16px" }}>
        {!editing && <ViewLayout />}
        {editing && (
          <Row gutter={24}>
            <Col xs={24} lg={8}>
              <Card title="Logo & Branding">
                <Space direction="vertical" size="large" style={{ width: "100%", textAlign: "center" }}>
                  <Avatar size={120} src={logoUrl} style={{ marginBottom: 16 }}>
                    {company?.name?.charAt(0) || "C"}
                  </Avatar>
                  <Upload beforeUpload={onUploadLogo} maxCount={1} accept="image/*" showUploadList={false}>
                    <Button icon={<UploadOutlined />} block>
                      Change Logo
                    </Button>
                  </Upload>
                </Space>
              </Card>
            </Col>

            <Col xs={24} lg={16}>
              <Card>
                <Space direction="vertical" size="large" style={{ width: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Title level={3} style={{ margin: 0 }}>
                      Edit Company
                    </Title>
                    <Button onClick={() => setEditing(false)}>Cancel</Button>
                  </div>

                  <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                      name: company?.name,
                      industry: company?.industry,
                      website: company?.website,
                      description: company?.description,
                      email: company?.email,
                      phone: company?.phone,
                      fullAddress: company?.address?.fullAddress,
                    }}
                    onFinish={onSave}
                  >
                    <Form.Item name="name" label="Company Name" rules={[{ required: true, message: "Please enter company name" }]}>
                      <Input placeholder="Enter company name" />
                    </Form.Item>
                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item name="industry" label="Industry">
                          <Input placeholder="e.g. Manufacturing" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="website" label="Website">
                          <Input placeholder="https://..." />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item name="email" label="Contact Email">
                          <Input placeholder="name@company.com" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="phone" label="Contact Phone">
                          <Input placeholder="+60 ..." />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item name="fullAddress" label="Address">
                      <Input placeholder="Full address" />
                    </Form.Item>
                    <Form.Item name="description" label="Company Description">
                      <TextArea rows={4} placeholder="Describe your company" />
                    </Form.Item>

                    <Form.Item style={{ textAlign: "right", marginBottom: 0 }}>
                      <Space>
                        <Button onClick={() => setEditing(false)}>Cancel</Button>
                        <Button htmlType="submit" type="primary">
                          Save Changes
                        </Button>
                      </Space>
                    </Form.Item>
                  </Form>
                </Space>
              </Card>
            </Col>
          </Row>
        )}
      </Layout.Content>
      <Footer />
    </Layout>
  );
}

