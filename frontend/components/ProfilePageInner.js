"use client";
import { useEffect, useState, useMemo, useCallback, memo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Layout, Card, Typography, Button, Space, Form, Input, Select, Upload, Checkbox, Avatar, message, Tabs, Tag, Progress, Row, Col, Modal, Steps, DatePicker } from 'antd';
import dynamic from 'next/dynamic';
const InternshipEditor = dynamic(() => import('./student/InternshipEditor'), { ssr: false, loading: () => <Card loading style={{ minHeight: 200 }} /> });
import { UploadOutlined, EditOutlined, PhoneOutlined, MailOutlined, PlusOutlined, FileTextOutlined, WarningOutlined, CalendarOutlined, EnvironmentOutlined, TrophyOutlined, BookOutlined } from '@ant-design/icons';
import Navbar from './Navbar';
import Footer from './Footer';
import { API_BASE_URL } from '../config';
import EditProfileModal from './EditProfileModal';

const { Title, Text } = Typography;

// Separate ViewLayout component to prevent re-creation on every render
// Memoized to prevent re-renders when props haven't changed
const ViewLayout = memo(function ViewLayout({ user, isOwner, fullName, onUploadAvatar, onUploadResume, setEditing }) {
  const tabItems = [
    {
      key: 'summary',
      label: 'Profile summary',
      children: (
        <div style={{ padding: '16px 0' }}>
          {/* Job Preferences */}
          <div>
            <Title level={5} style={{ margin: 0, marginBottom: 16 }}>Job Preferences</Title>

            {user?.internProfile?.preferences?.jobTypes && user.internProfile.preferences.jobTypes.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>Preferred Job Types</Text>
                <Space wrap size="small">
                  {user.internProfile.preferences.jobTypes.map((type, idx) => (
                    <Tag key={idx} color="blue">{type}</Tag>
                  ))}
                </Space>
              </div>
            )}

            {user?.internProfile?.preferences?.locations && user.internProfile.preferences.locations.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>Preferred Locations</Text>
                <Space wrap size="small">
                  {user.internProfile.preferences.locations.map((loc, idx) => (
                    <Tag key={idx} color="green"><EnvironmentOutlined /> {loc}</Tag>
                  ))}
                </Space>
              </div>
            )}

            {user?.internProfile?.preferences?.industries && user.internProfile.preferences.industries.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>Preferred Industries</Text>
                <Space wrap size="small">
                  {user.internProfile.preferences.industries.map((ind, idx) => (
                    <Tag key={idx} color="purple">{ind}</Tag>
                  ))}
                </Space>
              </div>
            )}

            {(!user?.internProfile?.preferences ||
              (!user.internProfile.preferences.jobTypes?.length &&
               !user.internProfile.preferences.locations?.length &&
               !user.internProfile.preferences.industries?.length)) && (
              <Text type="secondary">No job preferences set</Text>
            )}
          </div>

          {/* Skills and Languages */}
          <div style={{ marginTop: 32 }}>
            <Title level={5} style={{ margin: 0, marginBottom: 16 }}>Skills & Languages</Title>

            {user?.internProfile?.skills && user.internProfile.skills.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>Skills</Text>
                <Space wrap size="small">
                  {user.internProfile.skills.map((skill, idx) => (
                    <Tag key={idx} color="blue" style={{ padding: '4px 12px', borderRadius: 16 }}>
                      {skill}
                    </Tag>
                  ))}
                </Space>
              </div>
            )}

            {user?.internProfile?.languages && user.internProfile.languages.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>Languages</Text>
                <Space wrap size="small">
                  {user.internProfile.languages.map((lang, idx) => (
                    <Tag key={idx} color="green" style={{ padding: '4px 12px', borderRadius: 16 }}>
                      {lang}
                    </Tag>
                  ))}
                </Space>
              </div>
            )}

            {(!user?.internProfile?.skills?.length && !user?.internProfile?.languages?.length) && (
              <Text type="secondary">No skills or languages added</Text>
            )}
          </div>

          {/* Interests */}
          <div style={{ marginTop: 32 }}>
            <Title level={5} style={{ margin: 0, marginBottom: 16 }}>Interests</Title>
            {user?.internProfile?.interests && user.internProfile.interests.length > 0 ? (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {user.internProfile.interests.map((interest, idx) => (
                  <div key={idx} style={{ paddingLeft: 12, borderLeft: '2px solid #d9d9d9' }}>
                    <Text strong style={{ display: 'block' }}>{interest.title}</Text>
                    {interest.description && (
                      <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                        {interest.description}
                      </Text>
                    )}
                    {interest.socialLinks && interest.socialLinks.length > 0 && (
                      <div style={{ marginTop: 4 }}>
                        {interest.socialLinks.map((link, linkIdx) => (
                          <a key={linkIdx} href={link} target="_blank" rel="noopener noreferrer" style={{ marginRight: 8 }}>
                            <Button type="link" size="small">Link {linkIdx + 1}</Button>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </Space>
            ) : (
              <Text type="secondary">No interests added</Text>
            )}
          </div>

          {/* Resume */}
          <div style={{ marginTop: 32 }}>
            <Title level={5} style={{ margin: 0, marginBottom: 16 }}>Resume</Title>
            {user?.internProfile?.resume ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <FileTextOutlined />
                  <Text strong>Resume.pdf</Text>
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
            )}
          </div>
        </div>
      )
    },
    {
      key: 'education',
      label: 'Education',
      children: (
        <div style={{ padding: '16px 0' }}>
          <Title level={4} style={{ margin: 0, marginBottom: 16 }}>Education</Title>
          {user?.internProfile?.educations && user.internProfile.educations.length > 0 ? (
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {user.internProfile.educations.map((edu, idx) => (
                <Card key={idx} size="small" style={{ borderLeft: '3px solid #1890ff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <Text strong style={{ fontSize: 16, display: 'block' }}>
                        {edu.qualification || edu.level}
                      </Text>
                      {edu.institutionName && (
                        <Text style={{ color: '#1890ff', display: 'block', marginTop: 4 }}>
                          {edu.institutionName}
                        </Text>
                      )}
                      {edu.fieldOfStudy && (
                        <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                          {edu.fieldOfStudy}
                        </Text>
                      )}
                      {(edu.startDate || edu.endDate) && (
                        <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                          <CalendarOutlined /> {edu.startDate ? new Date(edu.startDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : ''}
                          {edu.endDate ? ` - ${new Date(edu.endDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}` : ' - Present'}
                        </Text>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </Space>
          ) : (
            <Text type="secondary">No education records added</Text>
          )}
        </div>
      )
    },
    {
      key: 'experience',
      label: 'Work Experience',
      children: (
        <div style={{ padding: '16px 0' }}>
          <Title level={4} style={{ margin: 0, marginBottom: 16 }}>Work Experience</Title>
          {user?.internProfile?.workExperiences && user.internProfile.workExperiences.length > 0 ? (
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {user.internProfile.workExperiences.map((work, idx) => (
                <Card key={idx} size="small" style={{ borderLeft: '3px solid #52c41a' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <Text strong style={{ fontSize: 16, display: 'block' }}>
                        {work.jobTitle}
                      </Text>
                      {work.companyName && (
                        <Text style={{ display: 'block', marginTop: 4 }}>
                          {work.companyName}
                        </Text>
                      )}
                      {work.employmentType && (
                        <Tag color="blue" style={{ marginTop: 4 }}>{work.employmentType}</Tag>
                      )}
                      {work.industry && (
                        <Tag color="purple" style={{ marginTop: 4 }}>{work.industry}</Tag>
                      )}
                      {(work.startDate || work.endDate) && (
                        <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                          <CalendarOutlined /> {work.startDate ? new Date(work.startDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : ''}
                          {work.endDate ? ` - ${new Date(work.endDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}` : ' - Present'}
                        </Text>
                      )}
                      {work.jobDescription && (
                        <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                          {work.jobDescription}
                        </Text>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </Space>
          ) : (
            <Text type="secondary">No work experience added</Text>
          )}
        </div>
      )
    },
    {
      key: 'certifications',
      label: 'Certifications',
      children: (
        <div style={{ padding: '16px 0' }}>
          <Title level={4} style={{ margin: 0, marginBottom: 16 }}>Certifications</Title>
          {user?.internProfile?.certifications && user.internProfile.certifications.length > 0 ? (
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {user.internProfile.certifications.map((cert, idx) => (
                <Card key={idx} size="small" style={{ borderLeft: '3px solid #faad14' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <Text strong style={{ fontSize: 16, display: 'block' }}>
                        <TrophyOutlined /> {cert.title}
                      </Text>
                      {cert.issuer && (
                        <Text style={{ display: 'block', marginTop: 4 }}>
                          Issued by: {cert.issuer}
                        </Text>
                      )}
                      {cert.acquiredDate && (
                        <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                          <CalendarOutlined /> {new Date(cert.acquiredDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                        </Text>
                      )}
                      {cert.description && (
                        <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                          {cert.description}
                        </Text>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </Space>
          ) : (
            <Text type="secondary">No certifications added</Text>
          )}
        </div>
      )
    },
    {
      key: 'events',
      label: 'Event Experience',
      children: (
        <div style={{ padding: '16px 0' }}>
          <Title level={4} style={{ margin: 0, marginBottom: 16 }}>Event Experience</Title>
          {user?.internProfile?.eventExperiences && user.internProfile.eventExperiences.length > 0 ? (
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {user.internProfile.eventExperiences.map((event, idx) => (
                <Card key={idx} size="small" style={{ borderLeft: '3px solid #eb2f96' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <Text strong style={{ fontSize: 16, display: 'block' }}>
                        {event.eventName}
                      </Text>
                      {event.position && (
                        <Text style={{ display: 'block', marginTop: 4 }}>
                          Position: {event.position}
                        </Text>
                      )}
                      {event.location && (
                        <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                          <EnvironmentOutlined /> {event.location}
                        </Text>
                      )}
                      {(event.startDate || event.endDate) && (
                        <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                          <CalendarOutlined /> {event.startDate ? new Date(event.startDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : ''}
                          {event.endDate ? ` - ${new Date(event.endDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}` : ''}
                        </Text>
                      )}
                      {event.description && (
                        <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                          {event.description}
                        </Text>
                      )}
                      {event.socialLinks && event.socialLinks.length > 0 && (
                        <div style={{ marginTop: 8 }}>
                          {event.socialLinks.map((link, linkIdx) => (
                            <a key={linkIdx} href={link} target="_blank" rel="noopener noreferrer" style={{ marginRight: 8 }}>
                              <Button type="link" size="small">Link {linkIdx + 1}</Button>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </Space>
          ) : (
            <Text type="secondary">No event experience added</Text>
          )}
        </div>
      )
    },
    {
      key: 'courses',
      label: 'Courses',
      children: (
        <div style={{ padding: '16px 0' }}>
          <Title level={4} style={{ margin: 0, marginBottom: 16 }}>Courses</Title>
          {user?.internProfile?.courses && user.internProfile.courses.length > 0 ? (
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {user.internProfile.courses.map((course, idx) => (
                <Card key={idx} size="small" style={{ borderLeft: '3px solid #13c2c2' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <Text strong style={{ fontSize: 16, display: 'block' }}>
                        <BookOutlined /> {course.courseName}
                      </Text>
                      {course.courseId && (
                        <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                          Course ID: {course.courseId}
                        </Text>
                      )}
                      {course.courseDescription && (
                        <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                          {course.courseDescription}
                        </Text>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </Space>
          ) : (
            <Text type="secondary">No courses added</Text>
          )}
        </div>
      )
    },
    {
      key: 'assignments',
      label: 'Assignments',
      children: (
        <div style={{ padding: '16px 0' }}>
          <Title level={4} style={{ margin: 0, marginBottom: 16 }}>Assignments</Title>
          {user?.internProfile?.assignments && user.internProfile.assignments.length > 0 ? (
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {user.internProfile.assignments.map((assignment, idx) => (
                <Card key={idx} size="small" style={{ borderLeft: '3px solid #722ed1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <Text strong style={{ fontSize: 16, display: 'block' }}>
                        {assignment.title}
                      </Text>
                      {assignment.natureOfAssignment && (
                        <div style={{ marginTop: 4 }}>
                          <Tag color="purple">Nature: {assignment.natureOfAssignment}</Tag>
                        </div>
                      )}
                      {assignment.methodology && (
                        <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                          <strong>Methodology:</strong> {assignment.methodology}
                        </Text>
                      )}
                      {assignment.description && (
                        <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                          {assignment.description}
                        </Text>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </Space>
          ) : (
            <Text type="secondary">No assignments added</Text>
          )}
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
          <Card style={{ textAlign: 'center', position: 'relative', boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)" }}>
            {!isOwner && (
              <div style={{ position: 'absolute', top: 16, right: 16 }}>
                <Tag color="purple" style={{ borderRadius: 12 }}>Recruiter&apos;s view</Tag>
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
            {user?.internProfile?.university && (
              <Text style={{ fontSize: 16, fontWeight: 500, display: 'block', marginBottom: 4 }}>
                {user.internProfile.university}
              </Text>
            )}
            {user?.internProfile?.major && (
              <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                {user.internProfile.major}
              </Text>
            )}
            {(user?.internProfile?.gpa || user?.internProfile?.graduationYear || user?.profile?.icPassportNumber) && (
              <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'left', marginBottom: 16 }}>
                {user?.internProfile?.gpa && (
                  <div>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>GPA</Text>
                    <Text strong>{user.internProfile.gpa}</Text>
                  </div>
                )}
                {user?.internProfile?.graduationYear && (
                  <div>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Graduation</Text>
                    <Text strong>{user.internProfile.graduationYear}</Text>
                  </div>
                )}
                {user?.profile?.icPassportNumber && (
                  <div>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>IC/Passport</Text>
                    <Text strong>{user.profile.icPassportNumber}</Text>
                  </div>
                )}
              </div>
            )}
            {user?.updatedAt && (
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 16 }}>
                Profile last updated on: {new Date(user.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </Text>
            )}
            <div style={{ textAlign: 'left' }}>
              {user?.profile?.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <PhoneOutlined />
                  <Text>{user.profile.phone}</Text>
                </div>
              )}
              {user?.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <MailOutlined />
                  <Text>{user.email}</Text>
                </div>
              )}
              {isOwner && (
                <Button
                  type="primary"
                  block
                  icon={<EditOutlined />}
                  onClick={() => setEditModalVisible(true)}
                  style={{ marginTop: 8 }}
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </Card>

          {/* Profile Score */}
          <Card style={{boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)"}}>
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
          <Card title="Pending action" style={{boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)"}}>
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
        <Card style={{ minHeight: 600, boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)" }}>
          <Tabs
            key="profile-tabs"
            defaultActiveKey="summary"
            items={tabItems}
            tabBarStyle={{ marginBottom: 0 }}
          />
        </Card>
      </Col>
    </Row>
  );
});

export default function ProfilePageInner({ targetIdProp = null }) {
  const searchParams = useSearchParams();
  // Memoize targetId to prevent it from changing on every render
  const targetId = useMemo(() => {
    const id = targetIdProp || searchParams?.get('id') || null;
    return id;
  }, [targetIdProp, searchParams]);

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null); // loaded target user (self or others)
  const [meId, setMeId] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [updating, setUpdating] = useState(false);

  const fullName = useCallback((u) => {
    const p = u?.profile || {};
    return [p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ') || 'Unnamed User';
  }, []);

  // Load profile data - runs only when targetId changes
  useEffect(() => {
    (async () => {
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
    })();
  }, [targetId]); // Only re-run when targetId changes

  // Separate load function for manual reloading (after uploads, etc.)
  async function load() {
    try {
      setLoading(true);
      const token = localStorage.getItem('jf_token');
      if (!token) {
        message.info('Please sign in');
        window.location.href = '/login';
        return;
      }
      const meRes = await fetch(`${API_BASE_URL}/users/me`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!meRes.ok) throw new Error('Failed to load profile');
      const me = await meRes.json();
      setMeId(me?._id);

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
      setEditing(false);

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
  }

  const onUploadAvatar = useCallback(async (file) => {
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
  }, [isOwner, targetId]);

  const onUploadResume = useCallback(async (file) => {
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
            'internProfile.resume': url
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
  }, [isOwner, targetId]);

  const reloadUserData = useCallback(async () => {
    try {
      const token = localStorage.getItem('jf_token');
      const idToLoad = targetId || 'me';
      const res = await fetch(`${API_BASE_URL}/users/${idToLoad}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
      }
    } catch (e) {
      console.error('Failed to reload user data:', e);
    }
  }, [targetId]);

  const onFinish = useCallback(async (values) => {
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

      await reloadUserData();
      message.success('Profile updated');
      setEditing(false);
    } catch (e) {
      message.error(e.message || 'Update failed');
    } finally {
      setUpdating(false);
    }
  }, [isOwner, reloadUserData]);

  return (
    <Layout>
      <Navbar />
      <Layout.Content style={{ maxWidth: 1400, margin: '24px auto', padding: '0 16px' }}>
        {loading ? (
          <Card loading={loading} style={{ minHeight: 400 }} />
        ) : user ? (
          <>
            {!editing && <ViewLayout
              user={user}
              isOwner={isOwner}
              fullName={fullName}
              onUploadAvatar={onUploadAvatar}
              onUploadResume={onUploadResume}
              setEditing={setEditing}
            />}
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

            {/* Edit Profile Modal */}
            <EditProfileModal
              visible={editModalVisible}
              onClose={() => setEditModalVisible(false)}
              user={user}
              onSuccess={reloadUserData}
            />
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

