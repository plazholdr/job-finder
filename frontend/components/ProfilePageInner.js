"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Layout, Card, Typography, Button, Space, Upload, Avatar, message, Tag, Progress, Row, Col } from 'antd';
import { UploadOutlined, EditOutlined, PhoneOutlined, MailOutlined, FileTextOutlined, WarningOutlined, CalendarOutlined, EnvironmentOutlined, TrophyOutlined, BookOutlined, DownloadOutlined } from '@ant-design/icons';
import Navbar from './Navbar';
import Footer from './Footer';
import { API_BASE_URL } from '../config';
import EditProfileModal from './EditProfileModal';

const { Title, Text } = Typography;

function ProfilePageInner({ user, isOwner, fullName, onUploadAvatar, onUploadResume, onEditClick, onEditSection }) {
  const [avatarError, setAvatarError] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);

  // Generate signed URL for avatar display
  useEffect(() => {
    async function loadAvatar() {
      if (user?.profile?.avatar) {
        try {
          const res = await fetch(`${API_BASE_URL}/signed-url?url=${encodeURIComponent(user.profile.avatar)}`);
          if (res.ok) {
            const data = await res.json();
            setAvatarUrl(data.signedUrl);
          } else {
            setAvatarUrl(user.profile.avatar); // Fallback to original URL
          }
        } catch (e) {
          console.error('Failed to get signed URL:', e);
          setAvatarUrl(user.profile.avatar); // Fallback to original URL
        }
      } else {
        setAvatarUrl(null);
      }
    }
    loadAvatar();
  }, [user?.profile?.avatar]);

  // Extract filename from URL
  const getFilenameFromUrl = (url) => {
    if (!url) return 'Document';
    try {
      // Extract the last part of the URL path
      const urlParts = url.split('/');
      const filename = urlParts[urlParts.length - 1];
      // Remove query parameters if any
      const cleanFilename = filename.split('?')[0];
      // Decode URL encoding
      return decodeURIComponent(cleanFilename);
    } catch (e) {
      return 'Document';
    }
  };

  return (
    <Row gutter={10}>
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
              <Avatar
                size={80}
                src={!avatarError && avatarUrl ? avatarUrl : undefined}
                style={{ backgroundColor: '#7d69ff', fontSize: '32px', fontWeight: 'bold' }}
                onError={() => {
                  setAvatarError(true);
                  return true;
                }}
              >
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
              {isOwner && <Button type="text" icon={<EditOutlined />} size="small" onClick={onEditClick} />}
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
                  onClick={onEditClick}
                  style={{ marginTop: 8, background: 'linear-gradient(to right, #7d69ff, #917fff)', border: 'none', borderRadius: '25px', fontSize: '16px', fontWeight: '600', padding: '8px 25px', height: 'auto', boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)"  }}
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

      {/* Right Content - All sections as cards */}
      <Col xs={24} lg={16}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>

          {/* Internship Section */}
          <Card
            title="Internship Details"
            extra={isOwner && <Button type="text" icon={<EditOutlined />} size="small" onClick={() => onEditSection('internship')} />}
            style={{ boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)", minHeight: 150, width: 800}}
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>

              {/* Internship Duration & Preferences */}
              <Card size="small" style={{ borderLeft: '3px solid #7d69ff', backgroundColor: '#fafafa' }}>
                <Title level={5} style={{ margin: 0, marginBottom: 12, color: 'black' }}>Internship Preferences</Title>

                {(user?.internProfile?.preferences?.preferredStartDate || user?.internProfile?.preferences?.preferredEndDate) ? (
                  <div style={{ marginBottom: 12 }}>
                    <Text strong style={{ display: 'block', marginBottom: 4 }}>Duration</Text>
                    <Text>
                      {user.internProfile.preferences.preferredStartDate &&
                        new Date(user.internProfile.preferences.preferredStartDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {user.internProfile.preferences.preferredStartDate && user.internProfile.preferences.preferredEndDate && ' - '}
                      {user.internProfile.preferences.preferredEndDate &&
                        new Date(user.internProfile.preferences.preferredEndDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Text>
                  </div>
                ) : (
                  <div style={{ marginBottom: 12 }}>
                    <Text strong style={{ display: 'block', marginBottom: 4 }}>Duration</Text>
                    <Text type="secondary" italic>Please specify your preferred internship duration</Text>
                  </div>
                )}

                {user?.internProfile?.preferences?.industries && user.internProfile.preferences.industries.length > 0 ? (
                  <div style={{ marginBottom: 12 }}>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>Preferred Industry</Text>
                    <Space wrap size="small">
                      {user.internProfile.preferences.industries.map((industry, idx) => (
                        <Tag key={idx} color="purple">{industry}</Tag>
                      ))}
                    </Space>
                  </div>
                ) : (
                  <div style={{ marginBottom: 12 }}>
                    <Text strong style={{ display: 'block', marginBottom: 4 }}>Preferred Industry</Text>
                    <Text type="secondary" italic>No industry preferences specified</Text>
                  </div>
                )}

                {user?.internProfile?.preferences?.locations && user.internProfile.preferences.locations.length > 0 ? (
                  <div style={{ marginBottom: 12 }}>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>Preferred Location (1-3)</Text>
                    <Space wrap size="small">
                      {user.internProfile.preferences.locations.slice(0, 3).map((location, idx) => (
                        <Tag key={idx} color="geekblue" icon={<EnvironmentOutlined />}>{location}</Tag>
                      ))}
                    </Space>
                  </div>
                ) : (
                  <div style={{ marginBottom: 12 }}>
                    <Text strong style={{ display: 'block', marginBottom: 4 }}>Preferred Location (1-3)</Text>
                    <Text type="secondary" italic>No location preferences specified</Text>
                  </div>
                )}

                {(user?.internProfile?.preferences?.salaryRange?.min || user?.internProfile?.preferences?.salaryRange?.max) ? (
                  <div style={{ marginBottom: 12 }}>
                    <Text strong style={{ display: 'block', marginBottom: 4 }}>Preferred Salary Range</Text>
                    <Text>
                      RM {user.internProfile.preferences.salaryRange.min || 0} - RM {user.internProfile.preferences.salaryRange.max || 0}
                    </Text>
                  </div>
                ) : (
                  <div style={{ marginBottom: 12 }}>
                    <Text strong style={{ display: 'block', marginBottom: 4 }}>Preferred Salary Range</Text>
                    <Text type="secondary" italic>No salary range specified</Text>
                  </div>
                )}

                {user?.internProfile?.skills && user.internProfile.skills.length > 0 ? (
                  <div style={{ marginBottom: 12 }}>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>Skills</Text>
                    <Space wrap size="small">
                      {user.internProfile.skills.map((skill, idx) => (
                        <Tag key={idx} color="green">{skill}</Tag>
                      ))}
                    </Space>
                  </div>
                ) : (
                  <div style={{ marginBottom: 12 }}>
                    <Text strong style={{ display: 'block', marginBottom: 4 }}>Skills</Text>
                    <Text type="secondary" italic>No skills listed</Text>
                  </div>
                )}

                {user?.internProfile?.languages && user.internProfile.languages.length > 0 ? (
                  <div style={{ marginBottom: 0 }}>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>Languages</Text>
                    <Space wrap size="small">
                      {user.internProfile.languages.map((language, idx) => (
                        <Tag key={idx} color="cyan">{language}</Tag>
                      ))}
                    </Space>
                  </div>
                ) : (
                  <div style={{ marginBottom: 0 }}>
                    <Text strong style={{ display: 'block', marginBottom: 4 }}>Languages</Text>
                    <Text type="secondary" italic>No languages specified</Text>
                  </div>
                )}
              </Card>

              {/* Course Information */}
              <Card size="small" style={{ borderLeft: '3px solid #52c41a', backgroundColor: '#fafafa' }}>
                <Title level={5} style={{ margin: 0, marginBottom: 12, color: 'black' }}>Course Information</Title>
                {user?.internProfile?.courses && user.internProfile.courses.length > 0 ? (
                  <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    {user.internProfile.courses.map((course, idx) => (
                      <div key={idx} style={{ paddingBottom: idx < user.internProfile.courses.length - 1 ? 12 : 0, borderBottom: idx < user.internProfile.courses.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                        {course.courseId && (
                          <Text strong style={{ display: 'block', marginBottom: 4 }}>
                            <BookOutlined /> {course.courseId}
                          </Text>
                        )}
                        {course.courseName && (
                          <Text style={{ display: 'block', marginBottom: 4, fontSize: 16 }}>
                            {course.courseName}
                          </Text>
                        )}
                        {course.courseDescription && (
                          <Text type="secondary" style={{ display: 'block' }}>
                            {course.courseDescription}
                          </Text>
                        )}
                      </div>
                    ))}
                  </Space>
                ) : (
                  <Text type="secondary" italic>No course information provided</Text>
                )}
              </Card>

              {/* Assignment Information */}
              <Card size="small" style={{ borderLeft: '3px solid #fa8c16', backgroundColor: '#fafafa' }}>
                <Title level={5} style={{ margin: 0, marginBottom: 12, color: 'black' }}>Assignments</Title>
                {user?.internProfile?.assignments && user.internProfile.assignments.length > 0 ? (
                  <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    {user.internProfile.assignments.map((assignment, idx) => (
                      <div key={idx} style={{ paddingBottom: idx < user.internProfile.assignments.length - 1 ? 12 : 0, borderBottom: idx < user.internProfile.assignments.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                        {assignment.title && (
                          <Text strong style={{ display: 'block', marginBottom: 4, fontSize: 16 }}>
                            {assignment.title}
                          </Text>
                        )}
                        {assignment.natureOfAssignment && (
                          <div style={{ marginBottom: 4 }}>
                            <Tag color="orange">Nature: {assignment.natureOfAssignment}</Tag>
                          </div>
                        )}
                        {assignment.methodology && (
                          <Text style={{ display: 'block', marginBottom: 4 }}>
                            <strong>Methodology:</strong> {assignment.methodology}
                          </Text>
                        )}
                        {assignment.description && (
                          <Text type="secondary" style={{ display: 'block' }}>
                            {assignment.description}
                          </Text>
                        )}
                      </div>
                    ))}
                  </Space>
                ) : (
                  <Text type="secondary" italic>No assignment information available</Text>
                )}
              </Card>

            </Space>
          </Card>

          {/* Job Preferences Card */}
          <Card
            title="Job Preferences"
            extra={isOwner && <Button type="text" icon={<EditOutlined />} size="small" onClick={() => onEditSection('preferences')} />}
            style={{ boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)", minHeight: 150, width: 800 }}
          >
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
          </Card>

          {/* Resume Card */}
          <Card title="Resume" style={{ boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)", minHeight: 150, width: 800 }}>
            {user?.internProfile?.resume ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FileTextOutlined />
                    <Text strong>{user.internProfile.resumeOriginalName || getFilenameFromUrl(user.internProfile.resume)}</Text>
                  </div>
                  <a
                    href={user.internProfile.resume}
                    download={user.internProfile.resumeOriginalName || 'resume'}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      type="primary"
                      icon={<DownloadOutlined />}
                      size="small"
                    >
                      Download
                    </Button>
                  </a>
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
          </Card>

          {/* Education Card */}
          <Card
            title="Education"
            extra={isOwner && <Button type="text" icon={<EditOutlined />} size="small" onClick={() => onEditSection('education')} />}
            style={{ boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)", minHeight: 150, width: 800 }}
          >
            {user?.internProfile?.educations && user.internProfile.educations.length > 0 ? (
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                {user.internProfile.educations.map((edu, idx) => (
                  <Card key={idx} size="small" style={{ borderLeft: '3px solid #7d69ff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <Text strong style={{ fontSize: 16, display: 'block' }}>
                          {edu.qualification || edu.level}
                        </Text>
                        {edu.institutionName && (
                          <Text style={{ color: '#7d69ff', display: 'block', marginTop: 4 }}>
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
          </Card>

          {/* Work Experience Card */}
          <Card
            title="Work Experience"
            extra={isOwner && <Button type="text" icon={<EditOutlined />} size="small" onClick={() => onEditSection('experience')} />}
            style={{ boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)", minHeight: 150, width: 800 }}
          >
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
          </Card>

          {/* Certifications Card */}
          <Card
            title="Certifications"
            extra={isOwner && <Button type="text" icon={<EditOutlined />} size="small" onClick={() => onEditSection('certifications')} />}
            style={{ boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)", minHeight: 150, width: 800 }}
          >
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
                      {cert.fileUrl && (
                        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <FileTextOutlined style={{ color: '#1890ff' }} />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {cert.fileOriginalName || getFilenameFromUrl(cert.fileUrl)}
                          </Text>
                          <a
                            href={cert.fileUrl}
                            download={cert.fileOriginalName || 'certificate'}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button
                              type="link"
                              icon={<DownloadOutlined />}
                              size="small"
                              style={{ padding: 0 }}
                            >
                              Download
                            </Button>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </Space>
            ) : (
              <Text type="secondary">No certifications added</Text>
            )}
          </Card>

        </Space>
      </Col>
    </Row>
  );
}

function ProfilePageContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editSection, setEditSection] = useState('personal');

  const searchParams = useSearchParams();
  const idParam = searchParams?.get('id') ?? null;

  const fullName = useCallback((u) => {
    const p = u?.profile || {};
    return [p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ') || 'Unnamed User';
  }, []);

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
        const meRes = await fetch(`${API_BASE_URL}/users/me`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (!meRes.ok) throw new Error('Failed to load profile');
        const me = await meRes.json();

        const idToLoad = idParam || 'me';
        const res = await fetch(`${API_BASE_URL}/users/${idToLoad}`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (!res.ok) {
          if (res.status === 404) { message.warning('Profile not found'); } else { throw new Error('Failed to load profile'); }
          setUser(null);
          return;
        }
        const u = await res.json();
        setUser(u);

        const owner = !idParam || (me?._id && String(me._id) === String(u?._id));
        setIsOwner(!!owner);
      } catch (e) {
        message.error(e.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    })();
  }, [idParam]);

  const reloadUserData = useCallback(async () => {
    try {
      const token = localStorage.getItem('jf_token');
      const searchParams = new URLSearchParams(window.location.search);
      const idToLoad = searchParams.get('id') || 'me';
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
  }, []);

  const onUploadAvatar = useCallback(async (file) => {
    try {
      const token = localStorage.getItem('jf_token');
      const fd = new FormData();
      fd.append('avatar', file);
      message.loading('Uploading avatar...', 0);
      const up = await fetch(`${API_BASE_URL}/upload`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: fd });
      if (!up.ok) {
        const errorText = await up.text();
        throw new Error(errorText || 'Upload failed');
      }
      const data = await up.json();
      // Use public URL instead of signedUrl (signedUrl expires after 1 hour)
      const url = data?.files?.avatar?.[0]?.url || data?.files?.avatar?.[0]?.signedUrl;
      if (url) {
        const res = await fetch(`${API_BASE_URL}/users/me`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ 'profile.avatar': url })
        });
        if (res.ok) {
          message.destroy();
          message.success('Avatar updated!');
          await reloadUserData();
        } else {
          const errorText = await res.text();
          throw new Error(errorText || 'Failed to update avatar');
        }
      } else {
        throw new Error('No URL returned from upload');
      }
    } catch (e) {
      message.destroy();
      message.error(e.message || 'Upload failed');
      console.error('Avatar upload error:', e);
    }
    return false;
  }, [reloadUserData]);

  const onUploadResume = useCallback(async (file) => {
    try {
      const token = localStorage.getItem('jf_token');
      const fd = new FormData();
      fd.append('resume', file);
      message.loading('Uploading resume...', 0);
      const up = await fetch(`${API_BASE_URL}/upload`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: fd });
      if (!up.ok) throw new Error('Upload failed');
      const data = await up.json();
      // Use public URL instead of signedUrl (signedUrl expires after 1 hour)
      const url = data?.files?.resume?.[0]?.url || data?.files?.resume?.[0]?.signedUrl;
      const originalName = data?.files?.resume?.[0]?.originalName;
      if (url) {
        const res = await fetch(`${API_BASE_URL}/users/me`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            'internProfile.resume': url,
            'internProfile.resumeOriginalName': originalName
          })
        });
        if (res.ok) {
          message.destroy();
          message.success('Resume uploaded!');
          await reloadUserData();
        } else {
          throw new Error('Failed to update resume');
        }
      }
    } catch (e) {
      message.destroy();
      message.error(e.message || 'Upload failed');
    }
    return false;
  }, [reloadUserData]);

  const onEditClick = useCallback(() => {
    setEditSection('personal');
    setEditModalVisible(true);
  }, []);

  const onEditSection = useCallback((section) => {
    setEditSection(section);
    setEditModalVisible(true);
  }, []);

  const onCloseModal = useCallback(() => {
    setEditModalVisible(false);
  }, []);

  return (
    <Layout>
      <Navbar />
      <Layout.Content style={{ maxWidth: 1600, margin: '24px auto', padding: '0 24px' }}>
        {loading ? (
          <Card loading={loading} style={{ minHeight: 400, minWidth: 1200 }} />
        ) : user ? (
          <>
            <ProfilePageInner
              user={user}
              isOwner={isOwner}
              fullName={fullName}
              onUploadAvatar={onUploadAvatar}
              onUploadResume={onUploadResume}
              onEditClick={onEditClick}
              onEditSection={onEditSection}
            />

            <EditProfileModal
              visible={editModalVisible}
              onClose={onCloseModal}
              user={user}
              onSuccess={reloadUserData}
              section={editSection}
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

export default ProfilePageContent;
