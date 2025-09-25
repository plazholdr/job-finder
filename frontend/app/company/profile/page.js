"use client";
import { useState, useEffect } from 'react';
import { Layout, Card, Typography, Button, Space, Tag, Descriptions, message, Modal, Form, Input, Select, Upload } from 'antd';
import { EditOutlined, UploadOutlined, GlobalOutlined, EnvironmentOutlined, PlusOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import Image from 'next/image';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { API_BASE_URL } from '../../../config';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function CompanyProfilePage() {
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState(null);
  const [user, setUser] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [completionModalVisible, setCompletionModalVisible] = useState(false);
  const [completionLoading, setCompletionLoading] = useState(false);
  const [form] = Form.useForm();
  const [completionForm] = Form.useForm();

  useEffect(() => {
    loadCompanyProfile();
  }, []);

  async function loadCompanyProfile() {
    try {
      setLoading(true);
      const token = localStorage.getItem('jf_token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      // Decode JWT to get user info (simple approach)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const mockUser = { _id: payload.sub || payload.userId, role: 'company' };
        setUser(mockUser);

        // Get company profile using the user ID from token
        const companyRes = await fetch(`${API_BASE_URL}/companies?ownerUserId=${mockUser._id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!companyRes.ok) {
          if (companyRes.status === 403) {
            // Company not verified yet - redirect to pending approval page
            message.warning('Your company is pending approval. Please wait for admin approval.');
            window.location.href = '/company/pending-approval';
            return;
          } else {
            throw new Error('Failed to get company info');
          }
        }

        const companyData = await companyRes.json();

        if (companyData.data && companyData.data.length > 0) {
          const companyInfo = companyData.data[0];
          setCompany(companyInfo);

          // Check if company profile is incomplete and show completion modal
          if (isCompanyProfileIncomplete(companyInfo)) {
            setCompletionModalVisible(true);
          }
        } else {
          // No company profile yet, redirect to setup
          message.info('Please complete your company setup first.');
          window.location.href = '/company/setup';
          return;
        }
      } catch (jwtError) {
        console.error('Error decoding JWT:', jwtError);
        message.error('Invalid session. Please log in again.');
        localStorage.removeItem('jf_token');
        window.location.href = '/login';
        return;
      }
    } catch (error) {
      console.error('Error loading company profile:', error);
      message.error('Failed to load company profile');
    } finally {
      setLoading(false);
    }
  }

  // Check if company profile is incomplete
  function isCompanyProfileIncomplete(company) {
    if (!company) return true;

    // Check required fields for completion
    const requiredFields = [
      'logoKey',        // Company logo
      'description',    // Company description
      'industry',       // Company nature
      'address',        // Company address
      'email',          // Company PIC email
      'phone',          // Company PIC mobile number
      'website'         // Company website
    ];

    // Check if any required field is missing
    for (const field of requiredFields) {
      if (field === 'address') {
        if (!company.address || !company.address.fullAddress) {
          return true;
        }
      } else if (!company[field]) {
        return true;
      }
    }

    return false;
  }

  function handleEditClick() {
    if (!company) return;

    // Pre-fill form with current company data
    form.setFieldsValue({
      name: company.name,
      registrationNumber: company.registrationNumber,
      industry: company.industry,
      size: company.size,
      website: company.website,
      description: company.description,
      email: company.email,
      phone: company.phone,
      street: company.address?.street,
      city: company.address?.city,
      state: company.address?.state,
      country: company.address?.country,
      zipCode: company.address?.zipCode,
      fullAddress: company.address?.fullAddress,
    });

    setEditModalVisible(true);
  }

  async function handleUpdateSubmit(values) {
    try {
      setUpdateLoading(true);
      const token = localStorage.getItem('jf_token');

      const updateData = {
        name: values.name,
        registrationNumber: values.registrationNumber,
        industry: values.industry,
        size: values.size,
        website: values.website,
        description: values.description,
        email: values.email,
        phone: values.phone,
        address: {
          street: values.street,
          city: values.city,
          state: values.state,
          country: values.country,
          zipCode: values.zipCode,
          fullAddress: values.fullAddress,
        }
      };

      const res = await fetch(`${API_BASE_URL}/companies/${company._id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!res.ok) throw new Error('Failed to update company profile');

      const updatedCompany = await res.json();
      setCompany(updatedCompany);
      setEditModalVisible(false);
      form.resetFields();
      message.success('Company profile updated successfully!');

    } catch (error) {
      console.error('Error updating company profile:', error);
      message.error('Failed to update company profile');
    } finally {
      setUpdateLoading(false);
    }
  }

  async function handleCompletionSubmit(values) {
    try {
      setCompletionLoading(true);
      const token = localStorage.getItem('jf_token');

      // Handle logo upload first if provided
      let logoKey = company?.logoKey;
      if (values.logo && values.logo.file) {
        const formData = new FormData();
        formData.append('logo', values.logo.file);

        const uploadRes = await fetch(`${API_BASE_URL}/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          logoKey = uploadData?.files?.logo?.[0]?.key || uploadData?.files?.logo?.[0]?.Key;
        }
      }

      const updateData = {
        logoKey,
        description: values.description,
        industry: values.industry,
        website: values.website,
        email: values.email,
        phone: values.phone,
        address: {
          ...company?.address,
          fullAddress: values.address,
        }
      };

      const res = await fetch(`${API_BASE_URL}/companies/${company._id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!res.ok) throw new Error('Failed to update company profile');

      const updatedCompany = await res.json();
      setCompany(updatedCompany);
      setCompletionModalVisible(false);
      completionForm.resetFields();
      message.success('Company profile completed successfully!');

      // Reload the page to refresh the profile
      window.location.reload();
    } catch (error) {
      console.error('Error completing company profile:', error);
      message.error('Failed to complete company profile');
    } finally {
      setCompletionLoading(false);
    }
  }

  if (loading) {
    return (
      <Layout>
        <Navbar />
        <Layout.Content style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Text>Loading company profile...</Text>
          </div>
        </Layout.Content>
        <Footer />
      </Layout>
    );
  }

  if (!company) {
    return (
      <Layout>
        <Navbar />
        <Layout.Content style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Title level={3}>No Company Profile Found</Title>
            <Text>Please complete your company setup first.</Text>
            <br />
            <Button type="primary" href="/company/setup" style={{ marginTop: 16 }}>
              Complete Setup
            </Button>
          </div>
        </Layout.Content>
        <Footer />
      </Layout>
    );
  }

  const logoUrl = company.logoKey ? `${process.env.NEXT_PUBLIC_STORAGE_URL}/${company.logoKey}` : null;
  const verificationStatus = company.verifiedStatus === 1 ? 'Approved' : company.verifiedStatus === 2 ? 'Rejected' : 'Pending';
  const statusColor = company.verifiedStatus === 1 ? 'green' : company.verifiedStatus === 2 ? 'red' : 'orange';

  return (
    <Layout>
      <Navbar />
      <Layout.Content style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Header with Company Info */}
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Space align="start" size="large">
                {/* Company Logo */}
                <div style={{ flexShrink: 0 }}>
                  {logoUrl ? (
                    <Image
                      src={logoUrl}
                      alt={`${company.name} logo`}
                      width={80}
                      height={80}
                      style={{
                        objectFit: 'contain',
                        borderRadius: 8,
                        border: '1px solid #f0f0f0'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: 80,
                      height: 80,
                      background: '#f8f9fa',
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #e9ecef',
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: '#6c757d'
                    }}>
                      {company.name?.charAt(0)?.toUpperCase() || 'C'}
                    </div>
                  )}
                </div>

                {/* Company Details */}
                <div>
                  <Title level={2} style={{ margin: 0, marginBottom: 8 }}>
                    {company.name}
                  </Title>

                  <Space wrap style={{ marginBottom: 12 }}>
                    <Tag color={statusColor}>
                      Status: {verificationStatus}
                    </Tag>
                    {company.industry && (
                      <Tag color="blue">{company.industry}</Tag>
                    )}
                    {company.address?.city && (
                      <Tag icon={<EnvironmentOutlined />}>
                        {company.address.city}
                        {company.address.state && `, ${company.address.state}`}
                      </Tag>
                    )}
                  </Space>

                  {company.website && (
                    <div style={{ marginBottom: 8 }}>
                      <Button
                        type="link"
                        icon={<GlobalOutlined />}
                        href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                        target="_blank"
                        style={{ padding: 0, height: 'auto' }}
                      >
                        Visit Website
                      </Button>
                    </div>
                  )}
                </div>
              </Space>

              {/* Update Profile Button */}
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={handleEditClick}
              >
                Update Profile
              </Button>
            </div>
          </Card>

          {/* Detailed Information */}
          <Card title="Company Information">
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Company Name">{company.name}</Descriptions.Item>
              <Descriptions.Item label="Registration Number">{company.registrationNumber || 'Not provided'}</Descriptions.Item>
              <Descriptions.Item label="Industry">{company.industry || 'Not specified'}</Descriptions.Item>
              <Descriptions.Item label="Company Size">{company.size || 'Not specified'}</Descriptions.Item>
              <Descriptions.Item label="Email">{company.email || 'Not provided'}</Descriptions.Item>
              <Descriptions.Item label="Phone">{company.phone || 'Not provided'}</Descriptions.Item>
              <Descriptions.Item label="Website">{company.website || 'Not provided'}</Descriptions.Item>
              <Descriptions.Item label="Verification Status">
                <Tag color={statusColor}>{verificationStatus}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Description" span={2}>
                {company.description || 'No description provided'}
              </Descriptions.Item>
              <Descriptions.Item label="Address" span={2}>
                {company.address?.fullAddress ||
                 [company.address?.street, company.address?.city, company.address?.state, company.address?.country]
                   .filter(Boolean).join(', ') || 'Not provided'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Space>
      </Layout.Content>
      <Footer />

      {/* Edit Modal */}
      <Modal
        title="Update Company Profile"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateSubmit}
        >
          <Form.Item name="name" label="Company Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Acme Sdn Bhd" />
          </Form.Item>

          <Form.Item name="registrationNumber" label="Registration Number">
            <Input placeholder="e.g. 202001234567" />
          </Form.Item>

          <Form.Item name="industry" label="Industry">
            <Select placeholder="Select industry">
              <Select.Option value="Technology">Technology</Select.Option>
              <Select.Option value="Finance">Finance</Select.Option>
              <Select.Option value="Healthcare">Healthcare</Select.Option>
              <Select.Option value="Education">Education</Select.Option>
              <Select.Option value="Manufacturing">Manufacturing</Select.Option>
              <Select.Option value="Retail">Retail</Select.Option>
              <Select.Option value="Consulting">Consulting</Select.Option>
              <Select.Option value="Other">Other</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="size" label="Company Size">
            <Select placeholder="Select company size">
              <Select.Option value="1-10">1-10 employees</Select.Option>
              <Select.Option value="11-50">11-50 employees</Select.Option>
              <Select.Option value="51-200">51-200 employees</Select.Option>
              <Select.Option value="201-500">201-500 employees</Select.Option>
              <Select.Option value="500+">500+ employees</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="website" label="Website">
            <Input placeholder="e.g. https://company.com" />
          </Form.Item>

          <Form.Item name="email" label="Contact Email">
            <Input placeholder="e.g. contact@company.com" />
          </Form.Item>

          <Form.Item name="phone" label="Contact Phone">
            <Input placeholder="e.g. +60123456789" />
          </Form.Item>

          <Form.Item name="description" label="Company Description">
            <TextArea rows={4} placeholder="Describe your company..." />
          </Form.Item>

          <Title level={5}>Address Information</Title>

          <Form.Item name="street" label="Street Address">
            <Input placeholder="e.g. 123 Main Street" />
          </Form.Item>

          <Space.Compact style={{ width: '100%' }}>
            <Form.Item name="city" label="City" style={{ width: '50%' }}>
              <Input placeholder="e.g. Kuala Lumpur" />
            </Form.Item>
            <Form.Item name="state" label="State" style={{ width: '50%' }}>
              <Input placeholder="e.g. Selangor" />
            </Form.Item>
          </Space.Compact>

          <Space.Compact style={{ width: '100%' }}>
            <Form.Item name="country" label="Country" style={{ width: '50%' }}>
              <Input placeholder="e.g. Malaysia" />
            </Form.Item>
            <Form.Item name="zipCode" label="Zip Code" style={{ width: '50%' }}>
              <Input placeholder="e.g. 50000" />
            </Form.Item>
          </Space.Compact>

          <Form.Item name="fullAddress" label="Full Address">
            <TextArea rows={2} placeholder="Complete address..." />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setEditModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={updateLoading}>
                Update Profile
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Company Profile Completion Modal */}
      <Modal
        title="Complete Your Company Profile"
        open={completionModalVisible}
        onCancel={() => setCompletionModalVisible(false)}
        footer={null}
        width={600}
        closable={false}
        maskClosable={false}
      >
        <div style={{ marginBottom: 16 }}>
          <Typography.Text type="secondary">
            Welcome! Please complete your company profile to get started. This information will help students and employers find you.
          </Typography.Text>
        </div>

        <Form
          form={completionForm}
          layout="vertical"
          onFinish={handleCompletionSubmit}
        >
          <Form.Item
            name="logo"
            label="Company Logo"
            rules={[{ required: true, message: 'Please upload your company logo' }]}
          >
            <Upload
              beforeUpload={() => false}
              maxCount={1}
              accept="image/*"
              listType="picture-card"
            >
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload Logo</div>
              </div>
            </Upload>
          </Form.Item>

          <Form.Item
            name="description"
            label="Company Description"
            rules={[{ required: true, message: 'Please enter company description' }]}
          >
            <TextArea rows={4} placeholder="Describe your company, what you do, your mission..." />
          </Form.Item>

          <Form.Item
            name="industry"
            label="Company Nature/Industry"
            rules={[{ required: true, message: 'Please select your industry' }]}
          >
            <Select placeholder="Select your industry">
              <Select.Option value="Technology">Technology</Select.Option>
              <Select.Option value="Finance">Finance</Select.Option>
              <Select.Option value="Healthcare">Healthcare</Select.Option>
              <Select.Option value="Education">Education</Select.Option>
              <Select.Option value="Manufacturing">Manufacturing</Select.Option>
              <Select.Option value="Retail">Retail</Select.Option>
              <Select.Option value="Consulting">Consulting</Select.Option>
              <Select.Option value="Media">Media</Select.Option>
              <Select.Option value="Real Estate">Real Estate</Select.Option>
              <Select.Option value="Other">Other</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="address"
            label="Company Address"
            rules={[{ required: true, message: 'Please enter company address' }]}
          >
            <TextArea rows={2} placeholder="Full company address..." />
          </Form.Item>

          <Form.Item
            name="email"
            label="Company PIC Email"
            rules={[
              { required: true, message: 'Please enter PIC email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input placeholder="pic@company.com" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Company PIC Mobile Number"
            rules={[{ required: true, message: 'Please enter PIC mobile number' }]}
          >
            <Input placeholder="+60123456789" />
          </Form.Item>

          <Form.Item
            name="website"
            label="Company Website"
            rules={[{ required: true, message: 'Please enter company website' }]}
          >
            <Input placeholder="https://www.company.com" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={completionLoading}
              size="large"
            >
              Complete Profile
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}
