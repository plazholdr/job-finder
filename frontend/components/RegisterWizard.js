"use client";
import { useState, useMemo } from 'react';
import { Steps, Form, Input, Button, Space, DatePicker, Select, Card, App, Typography, Checkbox } from 'antd';
import { API_BASE_URL } from '../config';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;


const EDU_LEVELS = ['Diploma', 'Degree', 'Master', 'PhD', 'Certificate', 'Other'];
const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'];

export default function RegisterWizard() {
  const { message } = App.useApp();
  const [current, setCurrent] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [form] = Form.useForm();

  const steps = useMemo(() => ([
    { key: 'account', title: 'Account' },
    { key: 'profile', title: 'Profile' },
    { key: 'education', title: 'Education' },
    { key: 'certs', title: 'Certifications' },
    { key: 'interests', title: 'Interests' },
    { key: 'work', title: 'Work' },
    { key: 'events', title: 'Events' },
  ]), []);

  async function handleSubmitAll(values) {
    // Compose payload matching backend schema
    const { username, password, email: emailInput, firstName, middleName, lastName, phone, icPassportNumber } = values;

    // Determine email/username relationship
    const usernameStr = String(username || '').trim().toLowerCase();
    const emailStr = String(emailInput || '').trim().toLowerCase();
    const isUsernameEmail = /@/.test(usernameStr);
    const email = isUsernameEmail ? usernameStr : emailStr;
    if (!email) { setCurrent(0); message.error('Email is required'); await form.validateFields(['email']); return; }

    const educations = (values.educations || []).map((e) => ({
      level: e?.level || undefined,
      institutionName: e?.institutionName || undefined,
      qualification: e?.qualification || undefined,
      startDate: e?.period?.[0] ? e.period[0] : undefined,
      endDate: e?.period?.[1] ? e.period[1] : undefined,
      fieldOfStudy: e?.fieldOfStudy || undefined,
    }));

    const certifications = (values.certifications || []).map((c) => ({
      title: c?.title || undefined,
      issuer: c?.issuer || undefined,
      acquiredDate: c?.acquiredDate || undefined,
      description: c?.description || undefined,
    }));

    const interests = (values.interests || []).map((i) => ({
      title: i?.title || undefined,
      description: i?.description || undefined,
      socialLinks: i?.socialLink ? [i.socialLink] : [],
      thumbnailUrl: i?.thumbnailUrl || undefined,
    }));

    const workExperiences = (values.workExperiences || []).map((w) => ({
      companyName: w?.companyName || undefined,
      industry: w?.industryOther ? w.industryOther : (w?.industry || undefined),
      jobTitle: w?.jobTitle || undefined,
      employmentType: w?.employmentType || undefined,
      startDate: w?.startDate || undefined,
      endDate: w?.ongoing ? undefined : (w?.endDate || undefined),
      jobDescription: w?.jobDescription || undefined,
    }));

    const eventExperiences = (values.eventExperiences || []).map((ev) => ({
      eventName: ev?.eventName || undefined,
      description: ev?.description || undefined,
      position: ev?.position || undefined,
      startDate: ev?.period?.[0] || undefined,
      endDate: ev?.period?.[1] || undefined,
      location: ev?.location || undefined,
      socialLinks: ev?.socialLink ? [ev.socialLink] : [],
    }));

    const payload = {
      role: 'student',
      username: usernameStr || undefined,
      email,
      password,
      profile: {
        firstName,
        middleName: middleName || undefined,
        lastName,
        phone: phone || undefined,
        avatar: undefined,
        icPassportNumber: icPassportNumber || undefined,
      },
      internProfile: {
        educations,
        certifications,
        interests,
        workExperiences,
        eventExperiences,
      },
    };

    // Convert dayjs to ISO
    const fixDates = (obj) => {
      for (const k in obj) {
        const v = obj[k];
        if (v && typeof v === 'object') {
          if (typeof v.toDate === 'function') obj[k] = v.toDate();
          else fixDates(v);
        }
      }
    };
    fixDates(payload);

    // Submit to backend
    const res = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Registration failed: ${res.status} ${txt}`);
    }
    const created = await res.json();

    // Auto-login to allow avatar upload
    try {
      const authRes = await fetch(`${API_BASE_URL}/authentication`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ strategy: 'local', email, password })
      });
      if (authRes.ok) {
        const authData = await authRes.json();
        const token = authData?.accessToken;
        if (token) {
          localStorage.setItem('jf_token', token);
          // If avatar file present, upload and patch profile.avatar
          if (avatarFile) {
            const fd = new FormData();
            fd.append('avatar', avatarFile);
            const upRes = await fetch(`${API_BASE_URL}/upload`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: fd });
            if (upRes.ok) {
              const up = await upRes.json();
              const url = up?.files?.avatar?.[0]?.url || up?.files?.avatar?.[0]?.signedUrl;
              if (url) {
                await fetch(`${API_BASE_URL}/users/${created?._id || 'me'}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                  body: JSON.stringify({ 'profile.avatar': url })
                });
              }
            }
          }
        }
      }
    } catch {}

    // Send verification email (best-effort)
    try {
      await fetch(`${API_BASE_URL}/email-verification`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email })
      });
    } catch {}

    message.success('Registration complete. Please check your email to verify your account.');
    window.location.href = '/';
  }

  async function handleNext() {
    try {
      // validate this step's fields only
      const stepKey = steps[current].key;
      let fields = [];
      switch (stepKey) {
        case 'account': fields = ['username','password','email']; break;
        case 'profile': fields = ['firstName','lastName','phone','icPassportNumber']; break;
        default: fields = []; break;
      }
      console.log('Validating fields:', fields);
      console.log('Form values:', form.getFieldsValue());
      await form.validateFields(fields);
      setCurrent((c) => c + 1);
    } catch (err) {
      console.error('Validation failed:', err);
      message.error('Please fill in all required fields correctly');
    }
  }

  async function handlePrev() { setCurrent((c) => c - 1); }

  async function handleFinish() {
    try {
      const values = form.getFieldsValue(true);
      setSubmitting(true);
      await handleSubmitAll(values);
    } catch (e) {
      if (e?.message) {
        message.error(e.message);
      }
    } finally { setSubmitting(false); }
  }

  const isLast = current === steps.length - 1;

  return (
    <Card>
      <Steps current={current} size="small" items={steps} style={{ marginBottom: 24 }} />
      <Form form={form} layout="vertical" onValuesChange={(changed)=>{ if (Object.prototype.hasOwnProperty.call(changed,'username')) { const v=String(changed.username||''); if (v.includes('@')) { const cur=form.getFieldValue('email'); if (!cur) form.setFieldsValue({ email:v }); } } }}>
        {current === 0 && (
          <>
            <Title level={5}>1. Account</Title>
            <Form.Item name="username" label="Username (can be email)" rules={[{ required: true }]}>
              <Input placeholder="username or email" onChange={(e)=>{ const v=e.target.value; form.setFieldsValue({ username:v }); if (v && v.includes('@')) { form.setFieldsValue({ email:v }); } }} />
            </Form.Item>
            <Form.Item name="password" label="Password" rules={[{ required: true, min: 6 }]}>
              <Input.Password placeholder="••••••••" />
            </Form.Item>
            <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}>
              <Input placeholder="name@example.com" />
            </Form.Item>

            <Text type="secondary">If your username is an email, we&apos;ll fill the email field for you automatically.</Text>
          </>
        )}

        {current === 1 && (
          <>
            <Title level={5}>2. Profile information</Title>
            <Form.Item name="firstName" label="First name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="middleName" label="Middle name (optional)">
              <Input />
            </Form.Item>
            <Form.Item name="lastName" label="Last name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="icPassportNumber" label="IC / Passport number">
              <Input />
            </Form.Item>
            <Form.Item name="phone" label="Phone number" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Photo (optional)">
              <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
            </Form.Item>

          </>
        )}

        {current === 2 && (
          <>
            <Title level={5}>3. Education background</Title>
            <Form.List name="educations">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...rest }) => (
                    <Card key={key} size="small" style={{ marginBottom: 12 }}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Form.Item {...rest} name={[name, 'level']} label="Level of education">
                          <Select options={EDU_LEVELS.map(v => ({ value: v, label: v }))} allowClear />
                        </Form.Item>
                        <Form.Item {...rest} name={[name, 'institutionName']} label="Institution name">
                          <Input />
                        </Form.Item>
                        <Form.Item {...rest} name={[name, 'qualification']} label="Qualification / Programme">
                          <Input />
                        </Form.Item>
                        <Form.Item {...rest} name={[name, 'period']} label="Start date - End date">
                          <RangePicker style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item {...rest} name={[name, 'fieldOfStudy']} label="Field of study">
                          <Input />
                        </Form.Item>
                        <Button danger onClick={() => remove(name)}>Remove</Button>
                      </Space>
                    </Card>
                  ))}
                  <Button onClick={() => add()}>Add education</Button>
                </>
              )}
            </Form.List>
          </>
        )}

        {current === 3 && (
          <>
            <Title level={5}>4. Certifications</Title>
            <Form.List name="certifications">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...rest }) => (
                    <Card key={key} size="small" style={{ marginBottom: 12 }}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Form.Item {...rest} name={[name, 'title']} label="Certificate title"><Input /></Form.Item>
                        <Form.Item {...rest} name={[name, 'issuer']} label="Certificate issuer"><Input /></Form.Item>
                        <Form.Item {...rest} name={[name, 'acquiredDate']} label="Acquired date"><DatePicker style={{ width: '100%' }} /></Form.Item>
                        <Form.Item {...rest} name={[name, 'description']} label="Description"><Input.TextArea rows={3} /></Form.Item>
                        <Button danger onClick={() => remove(name)}>Remove</Button>
                      </Space>
                    </Card>
                  ))}
                  <Button onClick={() => add()}>Add certification</Button>
                </>
              )}
            </Form.List>
          </>
        )}

        {current === 4 && (
          <>
            <Title level={5}>5. Interests</Title>
            <Form.List name="interests">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...rest }) => (
                    <Card key={key} size="small" style={{ marginBottom: 12 }}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Form.Item {...rest} name={[name, 'title']} label="Interest title"><Input /></Form.Item>
                        <Form.Item {...rest} name={[name, 'description']} label="Interest description"><Input.TextArea rows={3} /></Form.Item>
                        <Form.Item {...rest} name={[name, 'socialLink']} label="Social link"><Input placeholder="https://..." /></Form.Item>
                        <Form.Item {...rest} name={[name, 'thumbnailUrl']} label="Thumbnail URL (optional)"><Input placeholder="https://..." /></Form.Item>
                        <Button danger onClick={() => remove(name)}>Remove</Button>
                      </Space>
                    </Card>
                  ))}
                  <Button onClick={() => add()}>Add interest</Button>
                </>
              )}
            </Form.List>
          </>
        )}

        {current === 5 && (
          <>
            <Title level={5}>6. Work experience</Title>
            <Form.List name="workExperiences">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...rest }) => (
                    <Card key={key} size="small" style={{ marginBottom: 12 }}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Form.Item {...rest} name={[name, 'companyName']} label="Company name"><Input /></Form.Item>
                        <Form.Item {...rest} name={[name, 'industry']} label="Industry">
                          <Select allowClear options={['Finance','Technology','Education','Healthcare','Retail','Manufacturing','Other'].map(v => ({ value: v, label: v }))} />
                        </Form.Item>
                        <Form.Item noStyle shouldUpdate>
                          {({ getFieldValue }) => {
                            const sel = getFieldValue(['workExperiences', name, 'industry']);
                            return sel === 'Other' ? (
                              <Form.Item {...rest} name={[name, 'industryOther']} label="Industry (other)"><Input /></Form.Item>
                            ) : null;
                          }}
                        </Form.Item>
                        <Form.Item {...rest} name={[name, 'jobTitle']} label="Job title"><Input /></Form.Item>
                        <Form.Item {...rest} name={[name, 'employmentType']} label="Employment type">
                          <Select allowClear options={EMPLOYMENT_TYPES.map(v => ({ value: v, label: v }))} />
                        </Form.Item>
                        <Form.Item {...rest} name={[name, 'startDate']} label="Start date"><DatePicker style={{ width: '100%' }} /></Form.Item>
                        <Form.Item {...rest} name={[name, 'ongoing']} valuePropName="checked"><Checkbox>Ongoing</Checkbox></Form.Item>
                        <Form.Item noStyle shouldUpdate>
                          {({ getFieldValue }) => !getFieldValue(['workExperiences', name, 'ongoing']) ? (
                            <Form.Item {...rest} name={[name, 'endDate']} label="End date"><DatePicker style={{ width: '100%' }} /></Form.Item>
                          ) : null}
                        </Form.Item>
                        <Form.Item {...rest} name={[name, 'jobDescription']} label="Job description"><Input.TextArea rows={3} /></Form.Item>
                        <Button danger onClick={() => remove(name)}>Remove</Button>
                      </Space>
                    </Card>
                  ))}
                  <Button onClick={() => add()}>Add work experience</Button>
                </>
              )}
            </Form.List>
          </>
        )}

        {current === 6 && (
          <>
            <Title level={5}>7. Event experience</Title>
            <Form.List name="eventExperiences">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...rest }) => (
                    <Card key={key} size="small" style={{ marginBottom: 12 }}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Form.Item {...rest} name={[name, 'eventName']} label="Event name"><Input /></Form.Item>
                        <Form.Item {...rest} name={[name, 'description']} label="Event description"><Input.TextArea rows={3} /></Form.Item>
                        <Form.Item {...rest} name={[name, 'position']} label="Event position"><Input /></Form.Item>
                        <Form.Item {...rest} name={[name, 'period']} label="Event date (start-end)"><RangePicker style={{ width: '100%' }} /></Form.Item>
                        <Form.Item {...rest} name={[name, 'location']} label="Event location"><Input /></Form.Item>
                        <Form.Item {...rest} name={[name, 'socialLink']} label="Social link"><Input placeholder="https://..." /></Form.Item>
                        <Button danger onClick={() => remove(name)}>Remove</Button>
                      </Space>
                    </Card>
                  ))}
                  <Button onClick={() => add()}>Add event</Button>
                </>
              )}
            </Form.List>
          </>
        )}

        <Space style={{ marginTop: 12 }}>
          {current > 0 && (
            <Button onClick={handlePrev}>Previous</Button>
          )}
          {!isLast ? (
            <Button type="primary" onClick={handleNext}>Next</Button>
          ) : (
            <Button type="primary" loading={submitting} onClick={handleFinish}>Submit</Button>
          )}
        </Space>
      </Form>
    </Card>
  );
}

