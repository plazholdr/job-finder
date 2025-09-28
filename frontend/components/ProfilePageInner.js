"use client";
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Layout, Card, Typography, Button, Space, Form, Input, Select, Upload, Checkbox, Avatar, message, Tabs, Tag, Progress, Row, Col } from 'antd';
import dynamic from 'next/dynamic';
const InternshipEditor = dynamic(() => import('./student/InternshipEditor'), { ssr: false, loading: () => <Card loading style={{ minHeight: 200 }} /> });
import { UploadOutlined, EditOutlined, PhoneOutlined, MailOutlined, PlusOutlined, FileTextOutlined, WarningOutlined } from '@ant-design/icons';
import Navbar from './Navbar';
import Footer from './Footer';
import { API_BASE_URL } from '../config';

const { Title, Text } = Typography;

export default function ProfilePageInner({ targetIdProp = null }) {
  const searchParams = useSearchParams();
  const targetId = targetIdProp || searchParams?.get('id') || null; // if null, we'll use 'me'

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null); // loaded target user (self or others)
  const [meId, setMeId] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form] = Form.useForm();
  const [updating, setUpdating] = useState(false);

  const fullName = (u) => {
    const p = u?.profile || {};
    return [p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ') || 'Unnamed User';
  };

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('jf_token');
      if (!token) {
        message.info('Please sign in');
        window.location.href = '/login';
        return;
      }
      // Determine current user ID quickly by asking /users/me (password stripped)
      const meRes = await fetch(`${API_BASE_URL}/users/me`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!meRes.ok) throw new Error('Failed to load profile');
      const me = await meRes.json();
      setMeId(me?._id);

      // If a targetId is provided, load that; otherwise load self
      const idToLoad = targetId || 'me';
      const res = await fetch(`${API_BASE_URL}/users/${idToLoad}`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) {
        if (res.status === 404) { message.warning('Profile not found'); } else { throw new Error('Failed to load profile'); }
        setUser(null);
        return;
      }
      const u = await res.json();
      setUser(u);

      const owner = !targetId || (me?._id && String(me._id) === String(u?._id));
      setIsOwner(!!owner);
      setEditing(false); // default to view mode for everyone

      form.setFieldsValue({
        firstName: u?.profile?.firstName,
        middleName: u?.profile?.middleName,
        lastName: u?.profile?.lastName,
        phone: u?.profile?.phone,
        hidePhoneForCompanies: !!u?.profile?.hidePhoneForCompanies,
        privacySetting: u?.privacySetting || 'full',
      });
    } catch (e) {
      message.error(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [targetId, form]);

  useEffect(() => { load(); }, [load]);

  async function onUploadAvatar(file) {
    if (!isOwner) { message.info('You can only change your own avatar'); return false; }
    try {
      const token = localStorage.getItem('jf_token');
      const fd = new FormData();
      fd.append('avatar', file);
      message.loading('Uploading avatar...', 0);
      const up = await fetch(`${API_BASE_URL}/upload`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: fd });
      if (!up.ok) throw new Error('Upload failed');
      const data = await up.json();
      const url = data?.files?.avatar?.[0]?.url || data?.files?.avatar?.[0]?.signedUrl;
      if (url) {
        const res = await fetch(`${API_BASE_URL}/users/me`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ 'profile.avatar': url })
        });
        if (!res.ok) throw new Error('Failed to save avatar');
        message.destroy();
        message.success('Avatar updated successfully!');
        await load();
      }
    } catch (e) {
      message.destroy();
      message.error(e.message || 'Avatar upload failed');
    }
    return false; // prevent antd from uploading automatically
  }

  async function onUploadResume(file) {
    if (!isOwner) { message.info('You can only change your own resume'); return false; }
    try {
      const token = localStorage.getItem('jf_token');
      const fd = new FormData();
      fd.append('resume', file);
      message.loading('Uploading resume...', 0);
      const up = await fetch(`${API_BASE_URL}/upload`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: fd });
      if (!up.ok) throw new Error('Upload failed');
      const data = await up.json();
      const url = data?.files?.resume?.[0]?.url || data?.files?.resume?.[0]?.signedUrl;
      if (url) {
        const res = await fetch(`${API_BASE_URL}/users/me`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            'profile.resume': url,
            'profile.resumeName': file.name
          })
        });
        if (!res.ok) throw new Error('Failed to save resume');
        message.destroy();
        message.success('Resume uploaded successfully!');
        await load();
      }
    } catch (e) {
      message.destroy();
      message.error(e.message || 'Resume upload failed');
    }
    return false; // prevent antd from uploading automatically
  }

  async function onFinish(values) {
    if (!isOwner) { message.info('You can only update your own profile'); return; }
    try {
      setUpdating(true);
      const token = localStorage.getItem('jf_token');
      const body = {
        'profile.firstName': values.firstName,
        'profile.middleName': values.middleName || undefined,
        'profile.lastName': values.lastName,
        'profile.phone': values.phone || undefined,
        'profile.hidePhoneForCompanies': !!values.hidePhoneForCompanies,
        privacySetting: values.privacySetting,
      };
      const res = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Failed to update');
      }
      message.success('Profile updated');
      await load();
      setEditing(false);
    } catch (e) {
      message.error(e.message || 'Update failed');
    } finally {
      setUpdating(false);
    }
  }

  // View layout sections
  const ViewLayout = () => {
    const tabItems = [
      {
        key: 'summary',
        label: 'Profile summary',
        children: (
          <div style={{ padding: '16px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Title level={4} style={{ margin: 0 }}>Profile summary</Title>
              {isOwner && <Button type="text" icon={<EditOutlined />} />}
            </div>
            <Text style={{ fontSize: 16, lineHeight: 1.6 }}>
              {user?.profile?.bio || 'Experienced Professional having 4+ years of work experience currently living in Kuala Lumpur'}
            </Text>

            <div style={{ marginTop: 24 }}>
              <Title level={5}>Resume</Title>
              {user?.profile?.resume ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <FileTextOutlined />
                    <Text strong>{user.profile.resumeName || 'Latest resume.pdf'}</Text>
                    {isOwner && <Button type="text" icon={<EditOutlined />} size="small" />}
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>(*doc, docx, rtf, pdf Max file size is 6MB)</Text>
                  {isOwner && (
                    <div style={{ marginTop: 8 }}>
                      <Upload
                        beforeUpload={onUploadResume}
                        maxCount={1}
                        accept=".pdf,.doc,.docx,.rtf"
                        showUploadList={false}
                      >
                        <Button type="link" style={{ padding: 0 }}>Replace resume</Button>
                      </Upload>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>No resume uploaded</Text>
                  {isOwner && (
                    <Upload
                      beforeUpload={onUploadResume}
                      maxCount={1}
                      accept=".pdf,.doc,.docx,.rtf"
                      showUploadList={false}
                    >
                      <Button type="primary" icon={<UploadOutlined />}>Upload resume</Button>
                    </Upload>
                  )}
                </div>
              )}</div>
          </div>
        )
      },
      {
        key: 'experience',
        label: 'Work experience',
        children: (
          <div style={{ padding: '16px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Title level={4} style={{ margin: 0 }}>Work experience</Title>
              {isOwner && <Button type="text" icon={<PlusOutlined />} />}
            </div>
            {(user?.internProfile?.workExperiences || []).length === 0 ? (
              <Text type="secondary">No work experience added</Text>
            ) : (
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                {(user?.internProfile?.workExperiences || []).map((w, idx) => (
                  <div key={idx} style={{ borderLeft: '3px solid #1890ff', paddingLeft: 16, position: 'relative' }}>
                    <div style={{ position: 'absolute', left: -6, top: 0, width: 12, height: 12, borderRadius: '50%', backgroundColor: '#1890ff' }}></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <Text strong style={{ fontSize: 16 }}>{w?.jobTitle || 'STEM COACH'}</Text>
                        <div style={{ marginTop: 4 }}>
                          <Text style={{ fontSize: 14 }}>{w?.companyName || 'Realfun Academy Sdn Bhd'}</Text>
                        </div>
                        <div style={{ marginTop: 4 }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {w?.startDate ? new Date(w.startDate).toLocaleDateString() : 'Apr 2022'} - {w?.endDate ? new Date(w.endDate).toLocaleDateString() : 'Nov 2022'} (7 m) • Salary: MYR 250 (Monthly)
                          </Text>
                        </div>
                      </div>
                      {isOwner && <Button type="text" icon={<EditOutlined />} size="small" />}
                    </div>
                  </div>
                ))}
              </Space>
            )}
          </div>
        )
      },
      {
        key: 'skills',
        label: 'Skills',
        children: (
          <div style={{ padding: '16px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Title level={4} style={{ margin: 0 }}>Skills</Title>
              {isOwner && <Button type="text" icon={<EditOutlined />} />}
            </div>
            <Space wrap size="small">
              {['Css', 'Java Script', 'Html', 'Php', 'Python', 'css', 'python', 'php', 'html', 'nodejs'].map((skill, idx) => (
                <Tag key={idx} style={{ padding: '4px 12px', borderRadius: 16 }}>{skill}</Tag>
              ))}
              <Button type="dashed" size="small" style={{ borderRadius: 16 }}>+ 1 more</Button>
            </Space>
          </div>
        )
      },
      {
        key: 'education',
        label: 'Education',
        children: (
          <div style={{ padding: '16px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Title level={4} style={{ margin: 0 }}>Education</Title>
              {isOwner && <Button type="text" icon={<PlusOutlined />} />}
            </div>
            {(user?.internProfile?.educations || []).length === 0 ? (
              <div>
                <div style={{ marginBottom: 16 }}>
                  <Text strong style={{ fontSize: 16 }}>Bachelor of Computer Science (BCS) • Software Engineering</Text>
                  {isOwner && <Button type="text" icon={<EditOutlined />} size="small" style={{ marginLeft: 8 }} />}
                </div>
                <Text style={{ color: '#1890ff' }}>Management and Science University (MSU)</Text>
                <div style={{ marginTop: 4 }}>
                  <Text type="secondary">2026 • Part time</Text>
                </div>
              </div>
            ) : (
              <Space direction="vertical" style={{ width: '100%' }}>
                {(user?.internProfile?.educations || []).map((e, idx) => (
                  <div key={idx}>
                    <Text strong>{e?.qualification || e?.level}</Text>
                    <div><Text>{e?.institutionName}</Text></div>
                    <Text type="secondary">
                      {e?.startDate ? new Date(e.startDate).toLocaleDateString() : ''}
                      {e?.endDate ? ` - ${new Date(e.endDate).toLocaleDateString()}` : ''}
                    </Text>
                  </div>
                ))}
              </Space>
            )}
          </div>
        )
      },
      {
        key: 'preferences',
        label: 'Job preferences',
        children: (
          <div style={{ padding: '16px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Title level={4} style={{ margin: 0 }}>Job preferences</Title>
              {isOwner && <Button type="text" icon={<EditOutlined />} />}
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>Preferred Role</Text>
              <Text>Software Developer, Database Architect</Text>
            </div>
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>Preferred Location</Text>
              <Text>Malaysia, Kuala Lumpur</Text>
            </div>
          </div>
        )
      },
      {
        key: 'personal',
        label: 'Personal details',
        children: (
          <div style={{ padding: '16px 0' }}>
            <Title level={4}>Personal details</Title>
            <Text type="secondary">Personal information for profile completion</Text>
          </div>
        )
      },
      {
        key: 'internship',
        label: 'Internship',
        children: (
          <div style={{ padding: '16px 0' }}>
            <InternshipEditor />
          </div>
        )
      }
    ];

    return (
      <Row gutter={24}>
        {/* Left Sidebar */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Profile Header */}
            <Card style={{ textAlign: 'center', position: 'relative' }}>
              {!isOwner && (
                <div style={{ position: 'absolute', top: 16, right: 16 }}>
                  <Tag color="purple" style={{ borderRadius: 12 }}>👁️ Recruiter&apos;s view</Tag>
                </div>
              )}
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
                <Avatar size={80} src={user?.profile?.avatar}>
                  {fullName(user).charAt(0)}
                </Avatar>
                {isOwner && (
                  <Upload
                    beforeUpload={onUploadAvatar}
                    maxCount={1}
                    accept="image/*"
                    showUploadList={false}
                  >
                    <Button
                      type="primary"
                      size="small"
                      icon={<EditOutlined />}
                      style={{
                        position: 'absolute',
                        bottom: -5,
                        right: -5,
                        borderRadius: '50%',
                        width: 28,
                        height: 28,
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    />
                  </Upload>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
                <Title level={4} style={{ margin: 0 }}>{fullName(user)}</Title>
                {isOwner && <Button type="text" icon={<EditOutlined />} size="small" onClick={() => setEditing(true)} />}
              </div>
              <Text style={{ fontSize: 16, fontWeight: 500, display: 'block', marginBottom: 4 }}>
                {user?.internProfile?.jobTitle || 'Software Engineer'}
              </Text>
              <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                {user?.internProfile?.company || 'Cognizant'}
              </Text>
              <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'left', marginBottom: 16 }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Total exp</Text>
                  <Text strong>4 yrs 5 mos</Text>
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Salary</Text>
                  <Text strong>MYR 7.3k</Text>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>(Monthly)</Text>
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Notice period</Text>
                  <Text strong>30 days</Text>
                </div>
              </div>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 16 }}>
                📅 Profile last updated on: 15 Sept, 2025
              </Text>
              <div style={{ textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <PhoneOutlined />
                  <Text>{user?.profile?.phone || '+60 138373362'}</Text>
                  {isOwner && <Button type="text" icon={<EditOutlined />} size="small" onClick={() => setEditing(true)} />}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MailOutlined />
                  <Text>{user?.email || '53845tianbelulok@gmail.com'}</Text>
                </div>
              </div>
            </Card>

            {/* Profile Score */}
            <Card>
              <div style={{ textAlign: 'center' }}>
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
                  <Progress
                    type="circle"
                    percent={76}
                    size={80}
                    strokeColor="#ff7a00"
                    format={() => <span style={{ fontSize: 18, fontWeight: 'bold' }}>76%</span>}
                  />
                </div>
                <Title level={5} style={{ margin: 0, marginBottom: 8 }}>Profile score</Title>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Recruiters seek 100% profiles - complete yours to stand out!
                </Text>
              </div>
            </Card>

            {/* Pending Actions */}
            <Card title="Pending action">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <WarningOutlined style={{ color: '#faad14' }} />
                    <Text>Update Resume</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Tag color="green" size="small">+14%</Tag>
                    <Button type="text" size="small">›</Button>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <WarningOutlined style={{ color: '#faad14' }} />
                    <Text>Add Industry</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Tag color="green" size="small">+10%</Tag>
                    <Button type="text" size="small">›</Button>
                  </div>
                </div>
              </Space>
            </Card>
          </Space>
        </Col>

        {/* Right Content */}
        <Col xs={24} lg={16}>
          <Card style={{ minHeight: 600 }}>
            <Tabs
              defaultActiveKey="summary"
              items={tabItems}
              tabBarStyle={{ marginBottom: 0 }}
            />
          </Card>
        </Col>
      </Row>
    );
  };

  return (
    <Layout>
      <Navbar />
      <Layout.Content style={{ maxWidth: 1400, margin: '24px auto', padding: '0 16px' }}>
        {loading ? (
          <Card loading={loading} style={{ minHeight: 400 }} />
        ) : user ? (
          <>
            {!editing && <ViewLayout />}
            {editing && (
              <Row gutter={24}>
                <Col xs={24} lg={8}>
                  <Card title="Profile Picture & Documents">
                    <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
                      <div>
                        <Avatar size={120} src={user?.profile?.avatar} style={{ marginBottom: 16 }}>
                          {fullName(user).charAt(0)}
                        </Avatar>
                        <div>
                          <Upload beforeUpload={onUploadAvatar} maxCount={1} accept="image/*" showUploadList={false}>
                            <Button icon={<UploadOutlined />} block>Change Profile Picture</Button>
                          </Upload>
                        </div>
                      </div>

                      <div style={{ textAlign: 'left' }}>
                        <Title level={5}>Resume</Title>
                        {user?.profile?.resume ? (
                          <div style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                              <FileTextOutlined />
                              <Text>{user.profile.resumeName || 'Current resume'}</Text>
                            </div>
                            <Upload beforeUpload={onUploadResume} maxCount={1} accept=".pdf,.doc,.docx,.rtf" showUploadList={false}>
                              <Button icon={<UploadOutlined />} block>Replace Resume</Button>
                            </Upload>
                          </div>
                        ) : (
                          <Upload beforeUpload={onUploadResume} maxCount={1} accept=".pdf,.doc,.docx,.rtf" showUploadList={false}>
                            <Button type="primary" icon={<UploadOutlined />} block>Upload Resume</Button>
                          </Upload>
                        )}
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Supported formats: PDF, DOC, DOCX, RTF (Max 6MB)
                        </Text>
                      </div>
                    </Space>
                  </Card>
                </Col>

                <Col xs={24} lg={16}>
                  <Card>
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Title level={3} style={{ margin: 0 }}>Edit Profile</Title>
                        <Button onClick={() => setEditing(false)} type="default">Cancel</Button>
                      </div>

                      <Form form={form} layout="vertical" onFinish={onFinish}>
                        <Row gutter={16}>
                          <Col xs={24} sm={12}>
                            <Form.Item name="firstName" label="First Name" rules={[{ required: true, message: 'Please enter your first name' }]}>
                              <Input placeholder="Enter first name" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={12}>
                            <Form.Item name="middleName" label="Middle Name (Optional)">
                              <Input placeholder="Enter middle name" />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Row gutter={16}>
                          <Col xs={24} sm={12}>
                            <Form.Item name="lastName" label="Last Name" rules={[{ required: true, message: 'Please enter your last name' }]}>
                              <Input placeholder="Enter last name" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={12}>
                            <Form.Item name="phone" label="Phone Number">
                              <Input placeholder="Enter phone number" />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Form.Item name="privacySetting" label="Privacy Setting" rules={[{ required: true }]}>
                          <Select
                            placeholder="Select privacy level"
                            options={[
                              { label: 'Full access (can see everything)', value: 'full' },
                              { label: 'Restricted (hide name, email, contact number)', value: 'restricted' },
                              { label: 'Private (cannot be searched / viewed directly)', value: 'private' },
                            ]}
                          />
                        </Form.Item>

                        <Form.Item name="hidePhoneForCompanies" valuePropName="checked">
                          <Checkbox>Hide phone from companies (even on Full access)</Checkbox>
                        </Form.Item>

                        <Form.Item style={{ textAlign: 'right', marginBottom: 0, marginTop: 24 }}>
                          <Space>
                            <Button onClick={() => setEditing(false)}>Cancel</Button>
                            <Button htmlType="submit" type="primary" loading={updating} size="large">
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
          </>
        ) : (
          <Card>
            <Text>Profile not found</Text>
          </Card>
        )}
      </Layout.Content>
      <Footer />
    </Layout>
  );
}

