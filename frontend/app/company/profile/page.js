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
  Upload,
  message,
  Avatar,
  Skeleton,
} from "antd";
import {
  EditOutlined,
  UploadOutlined,
  GlobalOutlined,
  EnvironmentOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";



import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { API_BASE_URL } from "../../../config";
import dynamic from "next/dynamic";
const EditCompanyForm = dynamic(() => import("../../../components/company/EditCompanyForm"), { ssr: false, loading: () => <Card loading style={{ minHeight: 300 }} /> });


const { Title, Text } = Typography;


export default function CompanyProfilePage() {
  // Align with ProfilePageInner.js structure/state
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState(null);
  const [editing, setEditing] = useState(false);


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
      // Use public URL instead of signedUrl (signedUrl expires after 1 hour)
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
          <Card style={{ minHeight: 600 }}>
            <Tabs defaultActiveKey="overview" items={tabItems} tabBarStyle={{ marginBottom: 0 }} />
          </Card>
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
          <EditCompanyForm
            company={company}
            logoUrl={logoUrl}
            onUploadLogo={onUploadLogo}
            onSave={onSave}
            setEditing={setEditing}
          />
        )}
      </Layout.Content>
      <Footer />
    </Layout>
  );
}

