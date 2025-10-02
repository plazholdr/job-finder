"use client";
import { useState } from 'react';
import { Modal, Steps, Form, Input, Button, Space, DatePicker, Select, message, Tag } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { API_BASE_URL } from '../config';

const { TextArea } = Input;
const { Step } = Steps;

export default function EditProfileModal({ visible, onClose, user, onSuccess }) {
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const steps = [
    { title: 'Personal Info', key: 'personal' },
    { title: 'Education', key: 'education' },
    { title: 'Work Experience', key: 'experience' },
    { title: 'Certifications', key: 'certifications' },
    { title: 'Skills & Languages', key: 'skills' },
    { title: 'Interests', key: 'interests' },
    { title: 'Events', key: 'events' },
    { title: 'Courses', key: 'courses' },
    { title: 'Assignments', key: 'assignments' },
  ];

  // Initialize form with user data when modal opens
  useState(() => {
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
      });
    }
  }, [visible, user]);

  const next = () => setCurrent(current + 1);
  const prev = () => setCurrent(current - 1);

  const handleFinish = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const token = localStorage.getItem('jf_token');

      const body = {
        'profile.firstName': values.firstName,
        'profile.middleName': values.middleName,
        'profile.lastName': values.lastName,
        'profile.phone': values.phone,
        'profile.icPassportNumber': values.icPassportNumber,
        'internProfile.university': values.university,
        'internProfile.major': values.major,
        'internProfile.gpa': values.gpa,
        'internProfile.graduationYear': values.graduationYear,
        'internProfile.educations': values.educations || [],
        'internProfile.workExperiences': values.workExperiences || [],
        'internProfile.certifications': values.certifications || [],
        'internProfile.skills': values.skills || [],
        'internProfile.languages': values.languages || [],
        'internProfile.interests': values.interests || [],
        'internProfile.eventExperiences': values.eventExperiences || [],
        'internProfile.courses': values.courses || [],
        'internProfile.assignments': values.assignments || [],
      };

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
      setCurrent(0);
    } catch (e) {
      message.error(e.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (current) {
      case 0: // Personal Info
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

      case 1: // Education
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

      case 2: // Work Experience
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

      case 3: // Certifications
        return (
          <Form.List name="certifications">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} direction="vertical" style={{ width: '100%', marginBottom: 16, padding: 16, border: '1px solid #d9d9d9', borderRadius: 8 }}>
                    <Form.Item {...restField} name={[name, 'title']} label="Title">
                      <Input placeholder="Certification Title" />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'issuer']} label="Issuer">
                      <Input placeholder="Issuing Organization" />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'description']} label="Description">
                      <TextArea rows={2} placeholder="Description" />
                    </Form.Item>
                    <Button danger onClick={() => remove(name)} icon={<MinusCircleOutlined />}>Remove</Button>
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add Certification
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        );

      case 4: // Skills & Languages
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

      case 5: // Interests
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

      case 6: // Events
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

      case 7: // Courses
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

      case 8: // Assignments
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

      default:
        return null;
    }
  };

  return (
    <Modal
      title="Edit Profile"
      open={visible}
      onCancel={onClose}
      width={800}
      footer={null}
    >
      <Steps current={current} style={{ marginBottom: 24 }}>
        {steps.map(item => (
          <Step key={item.key} title={item.title} />
        ))}
      </Steps>

      <Form form={form} layout="vertical">
        <div style={{ minHeight: 300, maxHeight: 400, overflowY: 'auto', padding: '0 8px' }}>
          {renderStepContent()}
        </div>
      </Form>

      <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between' }}>
        <Button disabled={current === 0} onClick={prev}>
          Previous
        </Button>
        <div>
          {current < steps.length - 1 && (
            <Button type="primary" onClick={next}>
              Next
            </Button>
          )}
          {current === steps.length - 1 && (
            <Button type="primary" loading={loading} onClick={handleFinish}>
              Save Profile
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

