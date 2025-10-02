"use client";
import { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Space, Select, message, Upload } from 'antd';
import { PlusOutlined, MinusCircleOutlined, UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import { API_BASE_URL } from '../config';

const { TextArea } = Input;

export default function EditProfileModal({ visible, onClose, user, onSuccess, section = 'personal' }) {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [uploadingCert, setUploadingCert] = useState({});

  // Initialize form with user data when modal opens
  useEffect(() => {
    if (visible && user) {
      form.setFieldsValue({
        firstName: user?.profile?.firstName,
        middleName: user?.profile?.middleName,
        lastName: user?.profile?.lastName,
        phone: user?.profile?.phone,
        icPassportNumber: user?.profile?.icPassportNumber,
        university: user?.internProfile?.university,
        major: user?.internProfile?.major,
        gpa: user?.internProfile?.gpa,
        graduationYear: user?.internProfile?.graduationYear,
        educations: user?.internProfile?.educations || [],
        workExperiences: user?.internProfile?.workExperiences || [],
        certifications: user?.internProfile?.certifications || [],
        skills: user?.internProfile?.skills || [],
        languages: user?.internProfile?.languages || [],
        interests: user?.internProfile?.interests || [],
        eventExperiences: user?.internProfile?.eventExperiences || [],
        courses: user?.internProfile?.courses || [],
        assignments: user?.internProfile?.assignments || [],
        jobTypes: user?.internProfile?.preferences?.jobTypes || [],
        locations: user?.internProfile?.preferences?.locations || [],
        industries: user?.internProfile?.preferences?.industries || [],
        preferredStartDate: user?.internProfile?.preferences?.preferredStartDate,
        preferredEndDate: user?.internProfile?.preferences?.preferredEndDate,
        salaryMin: user?.internProfile?.preferences?.salaryRange?.min,
        salaryMax: user?.internProfile?.preferences?.salaryRange?.max,
      });
    }
  }, [visible, user, form]);

  const handleFinish = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const token = localStorage.getItem('jf_token');

      let body = {};

      // Only update the fields for the current section
      if (section === 'personal') {
        body = {
          'profile.firstName': values.firstName,
          'profile.middleName': values.middleName,
          'profile.lastName': values.lastName,
          'profile.phone': values.phone,
          'profile.icPassportNumber': values.icPassportNumber,
          'internProfile.university': values.university,
          'internProfile.major': values.major,
          'internProfile.gpa': values.gpa,
          'internProfile.graduationYear': values.graduationYear,
        };
      } else if (section === 'preferences') {
        body = {
          'internProfile.preferences.jobTypes': values.jobTypes || [],
          'internProfile.preferences.locations': values.locations || [],
          'internProfile.preferences.industries': values.industries || [],
        };
      } else if (section === 'skills') {
        body = {
          'internProfile.skills': values.skills || [],
          'internProfile.languages': values.languages || [],
        };
      } else if (section === 'education') {
        body = {
          'internProfile.educations': values.educations || [],
        };
      } else if (section === 'experience') {
        body = {
          'internProfile.workExperiences': values.workExperiences || [],
        };
      } else if (section === 'certifications') {
        body = {
          'internProfile.certifications': values.certifications || [],
        };
      } else if (section === 'interests') {
        body = {
          'internProfile.interests': values.interests || [],
        };
      } else if (section === 'events') {
        body = {
          'internProfile.eventExperiences': values.eventExperiences || [],
        };
      } else if (section === 'courses') {
        body = {
          'internProfile.courses': values.courses || [],
        };
      } else if (section === 'assignments') {
        body = {
          'internProfile.assignments': values.assignments || [],
        };
      } else if (section === 'internship') {
        body = {
          'internProfile.preferences.preferredStartDate': values.preferredStartDate,
          'internProfile.preferences.preferredEndDate': values.preferredEndDate,
          'internProfile.preferences.industries': values.industries || [],
          'internProfile.preferences.locations': values.locations || [],
          'internProfile.preferences.salaryRange.min': values.salaryMin,
          'internProfile.preferences.salaryRange.max': values.salaryMax,
          'internProfile.skills': values.skills || [],
          'internProfile.languages': values.languages || [],
          'internProfile.courses': values.courses || [],
          'internProfile.assignments': values.assignments || [],
        };
      }

      const res = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Failed to update');
      }

      message.success('Profile updated successfully!');
      onSuccess();
      onClose();
    } catch (e) {
      message.error(e.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const getSectionTitle = () => {
    const titles = {
      personal: 'Edit Personal Info',
      preferences: 'Edit Job Preferences',
      skills: 'Edit Skills & Languages',
      education: 'Edit Education',
      experience: 'Edit Work Experience',
      certifications: 'Edit Certifications',
      interests: 'Edit Interests',
      events: 'Edit Event Experience',
      courses: 'Edit Courses',
      assignments: 'Edit Assignments',
      internship: 'Edit Internship Details',
    };
    return titles[section] || 'Edit Profile';
  };

  const renderSectionContent = () => {
    switch (section) {
      case 'personal':
        return (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
              <Input placeholder="First Name" />
            </Form.Item>
            <Form.Item name="middleName" label="Middle Name">
              <Input placeholder="Middle Name" />
            </Form.Item>
            <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}>
              <Input placeholder="Last Name" />
            </Form.Item>
            <Form.Item name="phone" label="Phone">
              <Input placeholder="Phone Number" />
            </Form.Item>
            <Form.Item name="icPassportNumber" label="IC/Passport Number">
              <Input placeholder="IC/Passport Number" />
            </Form.Item>
            <Form.Item name="university" label="University">
              <Input placeholder="University" />
            </Form.Item>
            <Form.Item name="major" label="Major">
              <Input placeholder="Major/Field of Study" />
            </Form.Item>
            <Form.Item name="gpa" label="GPA">
              <Input placeholder="GPA" />
            </Form.Item>
            <Form.Item name="graduationYear" label="Graduation Year">
              <Input placeholder="Graduation Year" />
            </Form.Item>
          </Space>
        );

      case 'preferences':
        return (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Form.Item name="jobTypes" label="Job Types">
              <Select mode="tags" placeholder="Type and press Enter to add job types" style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="locations" label="Preferred Locations">
              <Select mode="tags" placeholder="Type and press Enter to add locations" style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="industries" label="Preferred Industries">
              <Select mode="tags" placeholder="Type and press Enter to add industries" style={{ width: '100%' }} />
            </Form.Item>
          </Space>
        );

      case 'skills':
        return (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Form.Item name="skills" label="Skills">
              <Select mode="tags" placeholder="Type and press Enter to add skills" style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="languages" label="Languages">
              <Select mode="tags" placeholder="Type and press Enter to add languages" style={{ width: '100%' }} />
            </Form.Item>
          </Space>
        );

      case 'education':
        return (
          <Form.List name="educations">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item {...restField} name={[name, 'level']} label="Level">
                      <Input placeholder="Level (e.g., Bachelor)" />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'institutionName']} label="Institution">
                      <Input placeholder="Institution Name" />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'qualification']} label="Qualification">
                      <Input placeholder="Qualification" />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'fieldOfStudy']} label="Field of Study">
                      <Input placeholder="Field of Study" />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add Education
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        );

      case 'experience':
        return (
          <Form.List name="workExperiences">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} direction="vertical" style={{ width: '100%', marginBottom: 16, padding: 16, border: '1px solid #d9d9d9', borderRadius: 8 }}>
                    <Form.Item {...restField} name={[name, 'jobTitle']} label="Job Title">
                      <Input placeholder="Job Title" />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'companyName']} label="Company">
                      <Input placeholder="Company Name" />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'employmentType']} label="Employment Type">
                      <Select placeholder="Select Type">
                        <Select.Option value="Full-time">Full-time</Select.Option>
                        <Select.Option value="Part-time">Part-time</Select.Option>
                        <Select.Option value="Internship">Internship</Select.Option>
                        <Select.Option value="Contract">Contract</Select.Option>
                      </Select>
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'industry']} label="Industry">
                      <Input placeholder="Industry" />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'jobDescription']} label="Description">
                      <TextArea rows={3} placeholder="Job Description" />
                    </Form.Item>
                    <Button danger onClick={() => remove(name)} icon={<MinusCircleOutlined />}>Remove</Button>
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add Work Experience
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        );

      case 'certifications':
        return (
          <Form.List name="certifications">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => {
                  const certValues = form.getFieldValue(['certifications', name]);
                  return (
                    <Space key={key} direction="vertical" style={{ width: '100%', marginBottom: 16, padding: 16, border: '1px solid #d9d9d9', borderRadius: 8 }}>
                      <Form.Item {...restField} name={[name, 'title']} label="Title">
                        <Input placeholder="Certification Title" />
                      </Form.Item>
                      <Form.Item {...restField} name={[name, 'issuer']} label="Issuer">
                        <Input placeholder="Issuing Organization" />
                      </Form.Item>
                      <Form.Item {...restField} name={[name, 'acquiredDate']} label="Acquired Date">
                        <Input type="date" />
                      </Form.Item>
                      <Form.Item {...restField} name={[name, 'description']} label="Description">
                        <TextArea rows={2} placeholder="Description" />
                      </Form.Item>
                      <Form.Item {...restField} name={[name, 'fileUrl']} label="Certificate Document">
                        <div>
                          {certValues?.fileUrl ? (
                            <div style={{ marginBottom: 8 }}>
                              <Space>
                                <Button
                                  type="link"
                                  icon={<UploadOutlined />}
                                  onClick={() => window.open(certValues.fileUrl, '_blank')}
                                  style={{ padding: 0 }}
                                >
                                  View Uploaded Certificate
                                </Button>
                                <Button
                                  danger
                                  type="text"
                                  size="small"
                                  icon={<DeleteOutlined />}
                                  onClick={() => {
                                    const certs = form.getFieldValue('certifications');
                                    certs[name].fileUrl = null;
                                    form.setFieldsValue({ certifications: certs });
                                  }}
                                >
                                  Remove
                                </Button>
                              </Space>
                            </div>
                          ) : null}
                          <Upload
                            beforeUpload={async (file) => {
                              try {
                                setUploadingCert({ ...uploadingCert, [name]: true });
                                const token = localStorage.getItem('jf_token');
                                const fd = new FormData();
                                fd.append('document', file);

                                const res = await fetch(`${API_BASE_URL}/upload`, {
                                  method: 'POST',
                                  headers: { 'Authorization': `Bearer ${token}` },
                                  body: fd
                                });

                                if (!res.ok) throw new Error('Upload failed');

                                const data = await res.json();
                                // Use public URL instead of signedUrl (signedUrl expires after 1 hour)
                                const url = data?.files?.document?.[0]?.url || data?.files?.document?.[0]?.signedUrl;
                                const originalName = data?.files?.document?.[0]?.originalName;

                                if (url) {
                                  const certs = form.getFieldValue('certifications');
                                  certs[name].fileUrl = url;
                                  certs[name].fileOriginalName = originalName;
                                  form.setFieldsValue({ certifications: certs });
                                  message.success('Certificate uploaded successfully!');
                                }
                              } catch (e) {
                                message.error('Upload failed: ' + e.message);
                              } finally {
                                setUploadingCert({ ...uploadingCert, [name]: false });
                              }
                              return false;
                            }}
                            maxCount={1}
                            accept=".pdf,.jpg,.jpeg,.png"
                            showUploadList={false}
                          >
                            <Button icon={<UploadOutlined />} loading={uploadingCert[name]}>
                              {certValues?.fileUrl ? 'Replace Certificate' : 'Upload Certificate'}
                            </Button>
                          </Upload>
                        </div>
                      </Form.Item>
                      <Button danger onClick={() => remove(name)} icon={<MinusCircleOutlined />}>Remove Certification</Button>
                    </Space>
                  );
                })}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add Certification
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        );

      case 'interests':
        return (
          <Form.List name="interests">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} direction="vertical" style={{ width: '100%', marginBottom: 16, padding: 16, border: '1px solid #d9d9d9', borderRadius: 8 }}>
                    <Form.Item {...restField} name={[name, 'title']} label="Title">
                      <Input placeholder="Interest Title" />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'description']} label="Description">
                      <TextArea rows={2} placeholder="Description" />
                    </Form.Item>
                    <Button danger onClick={() => remove(name)} icon={<MinusCircleOutlined />}>Remove</Button>
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add Interest
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        );

      case 'events':
        return (
          <Form.List name="eventExperiences">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} direction="vertical" style={{ width: '100%', marginBottom: 16, padding: 16, border: '1px solid #d9d9d9', borderRadius: 8 }}>
                    <Form.Item {...restField} name={[name, 'eventName']} label="Event Name">
                      <Input placeholder="Event Name" />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'position']} label="Position">
                      <Input placeholder="Your Position/Role" />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'location']} label="Location">
                      <Input placeholder="Location" />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'description']} label="Description">
                      <TextArea rows={2} placeholder="Description" />
                    </Form.Item>
                    <Button danger onClick={() => remove(name)} icon={<MinusCircleOutlined />}>Remove</Button>
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add Event Experience
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        );

      case 'courses':
        return (
          <Form.List name="courses">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} direction="vertical" style={{ width: '100%', marginBottom: 16, padding: 16, border: '1px solid #d9d9d9', borderRadius: 8 }}>
                    <Form.Item {...restField} name={[name, 'courseName']} label="Course Name">
                      <Input placeholder="Course Name" />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'courseId']} label="Course ID">
                      <Input placeholder="Course ID (optional)" />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'courseDescription']} label="Description">
                      <TextArea rows={2} placeholder="Course Description" />
                    </Form.Item>
                    <Button danger onClick={() => remove(name)} icon={<MinusCircleOutlined />}>Remove</Button>
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add Course
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        );

      case 'assignments':
        return (
          <Form.List name="assignments">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} direction="vertical" style={{ width: '100%', marginBottom: 16, padding: 16, border: '1px solid #d9d9d9', borderRadius: 8 }}>
                    <Form.Item {...restField} name={[name, 'title']} label="Assignment Title">
                      <Input placeholder="Assignment Title" />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'natureOfAssignment']} label="Nature of Assignment">
                      <Input placeholder="Nature of Assignment" />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'methodology']} label="Methodology">
                      <Input placeholder="Methodology" />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'description']} label="Description">
                      <TextArea rows={2} placeholder="Description" />
                    </Form.Item>
                    <Button danger onClick={() => remove(name)} icon={<MinusCircleOutlined />}>Remove</Button>
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add Assignment
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        );

      case 'internship':
        return (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            {/* Internship Preferences */}
            <div style={{ padding: 16, border: '1px solid #d9d9d9', borderRadius: 8 }}>
              <h3 style={{ marginTop: 0 }}>Internship Preferences</h3>

              <Form.Item name="preferredStartDate" label="Preferred Start Date">
                <Input type="date" />
              </Form.Item>

              <Form.Item name="preferredEndDate" label="Preferred End Date">
                <Input type="date" />
              </Form.Item>

              <Form.Item name="industries" label="Preferred Industry">
                <Select mode="tags" placeholder="Type and press Enter to add industries" style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item name="locations" label="Preferred Location (1-3)">
                <Select mode="tags" placeholder="Type and press Enter to add locations (max 3)" maxCount={3} style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item label="Preferred Salary Range">
                <Space.Compact style={{ width: '100%' }}>
                  <Form.Item name="salaryMin" noStyle>
                    <Input placeholder="Min (RM)" type="number" style={{ width: '50%' }} />
                  </Form.Item>
                  <Form.Item name="salaryMax" noStyle>
                    <Input placeholder="Max (RM)" type="number" style={{ width: '50%' }} />
                  </Form.Item>
                </Space.Compact>
              </Form.Item>

              <Form.Item name="skills" label="Skills">
                <Select mode="tags" placeholder="Type and press Enter to add skills" style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item name="languages" label="Languages">
                <Select mode="tags" placeholder="Type and press Enter to add languages" style={{ width: '100%' }} />
              </Form.Item>
            </div>

            {/* Course Information */}
            <div style={{ padding: 16, border: '1px solid #d9d9d9', borderRadius: 8 }}>
              <h3 style={{ marginTop: 0 }}>Course Information</h3>
              <Form.List name="courses">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Space key={key} direction="vertical" style={{ width: '100%', marginBottom: 16, padding: 12, border: '1px solid #d9d9d9', borderRadius: 8, backgroundColor: 'white' }}>
                        <Form.Item {...restField} name={[name, 'courseId']} label="Course ID">
                          <Input placeholder="e.g., CS101" />
                        </Form.Item>
                        <Form.Item {...restField} name={[name, 'courseName']} label="Course Name">
                          <Input placeholder="Course Name" />
                        </Form.Item>
                        <Form.Item {...restField} name={[name, 'courseDescription']} label="Course Description">
                          <TextArea rows={2} placeholder="Course Description" />
                        </Form.Item>
                        <Button danger onClick={() => remove(name)} icon={<MinusCircleOutlined />}>Remove Course</Button>
                      </Space>
                    ))}
                    <Form.Item>
                      <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                        Add Course
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </div>

            {/* Assignment Information */}
            <div style={{ padding: 16, border: '1px solid #d9d9d9', borderRadius: 8 }}>
              <h3 style={{ marginTop: 0 }}>Past/Current Assignments</h3>
              <Form.List name="assignments">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Space key={key} direction="vertical" style={{ width: '100%', marginBottom: 16, padding: 12, border: '1px solid #d9d9d9', borderRadius: 8, backgroundColor: 'white' }}>
                        <Form.Item {...restField} name={[name, 'title']} label="Assignment Title">
                          <Input placeholder="Assignment Title" />
                        </Form.Item>
                        <Form.Item {...restField} name={[name, 'natureOfAssignment']} label="Nature of Assignment">
                          <Input placeholder="e.g., Research, Development, Analysis" />
                        </Form.Item>
                        <Form.Item {...restField} name={[name, 'methodology']} label="Methodology">
                          <Input placeholder="Methodology used" />
                        </Form.Item>
                        <Form.Item {...restField} name={[name, 'description']} label="Description">
                          <TextArea rows={3} placeholder="Assignment Description" />
                        </Form.Item>
                        <Button danger onClick={() => remove(name)} icon={<MinusCircleOutlined />}>Remove Assignment</Button>
                      </Space>
                    ))}
                    <Form.Item>
                      <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                        Add Assignment
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </div>
          </Space>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      title={getSectionTitle()}
      open={visible}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="save" type="primary" loading={loading} onClick={handleFinish}>
          Save
        </Button>
      ]}
    >
      <Form form={form} layout="vertical">
        <div style={{ maxHeight: 500, overflowY: 'auto', padding: '0 8px' }}>
          {renderSectionContent()}
        </div>
      </Form>
    </Modal>
  );
}

