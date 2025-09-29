"use client";
import { useState } from 'react';
import { Layout, Card, Typography, Switch, Space, Divider, Button, message, Select } from 'antd';
import { MoonOutlined, SunOutlined, BellOutlined, GlobalOutlined, UserOutlined } from '@ant-design/icons';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useTheme } from '../../components/Providers';

const { Title, Text } = Typography;
const { Content } = Layout;

export default function SettingsPage() {
  const { theme, toggle } = useTheme();
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    jobAlerts: true,
    applicationUpdates: true,
    companyMessages: true
  });
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('Asia/Kuala_Lumpur');

  const handleNotificationChange = (key, value) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }));
    message.success('Notification preferences updated');
  };

  const handleLanguageChange = (value) => {
    setLanguage(value);
    message.success('Language preference updated');
  };

  const handleTimezoneChange = (value) => {
    setTimezone(value);
    message.success('Timezone preference updated');
  };

  return (
    <Layout>
      <Navbar />
      <Content style={{ padding: '24px', maxWidth: 800, margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: 24 }}>
          <Title level={2}>Settings</Title>
          <Text type="secondary">Manage your account preferences and settings</Text>
        </div>

        {/* Appearance Settings */}
        <Card style={{ marginBottom: 24 }}>
          <Title level={4} style={{ marginBottom: 16 }}>
            <SunOutlined style={{ marginRight: 8 }} />
            Appearance
          </Title>
          
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong>Dark Mode</Text>
                <br />
                <Text type="secondary">Switch between light and dark themes</Text>
              </div>
              <Switch 
                checked={theme === 'dark'} 
                onChange={toggle}
                checkedChildren={<MoonOutlined />}
                unCheckedChildren={<SunOutlined />}
              />
            </div>
          </Space>
        </Card>

        {/* Notification Settings */}
        <Card style={{ marginBottom: 24 }}>
          <Title level={4} style={{ marginBottom: 16 }}>
            <BellOutlined style={{ marginRight: 8 }} />
            Notifications
          </Title>
          
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong>Email Notifications</Text>
                <br />
                <Text type="secondary">Receive notifications via email</Text>
              </div>
              <Switch 
                checked={notifications.email} 
                onChange={(checked) => handleNotificationChange('email', checked)}
              />
            </div>
            
            <Divider style={{ margin: '12px 0' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong>Push Notifications</Text>
                <br />
                <Text type="secondary">Receive browser push notifications</Text>
              </div>
              <Switch 
                checked={notifications.push} 
                onChange={(checked) => handleNotificationChange('push', checked)}
              />
            </div>
            
            <Divider style={{ margin: '12px 0' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong>Job Alerts</Text>
                <br />
                <Text type="secondary">Get notified about new job opportunities</Text>
              </div>
              <Switch 
                checked={notifications.jobAlerts} 
                onChange={(checked) => handleNotificationChange('jobAlerts', checked)}
              />
            </div>
            
            <Divider style={{ margin: '12px 0' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong>Application Updates</Text>
                <br />
                <Text type="secondary">Updates on your job applications</Text>
              </div>
              <Switch 
                checked={notifications.applicationUpdates} 
                onChange={(checked) => handleNotificationChange('applicationUpdates', checked)}
              />
            </div>
            
            <Divider style={{ margin: '12px 0' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong>Company Messages</Text>
                <br />
                <Text type="secondary">Messages from companies and recruiters</Text>
              </div>
              <Switch 
                checked={notifications.companyMessages} 
                onChange={(checked) => handleNotificationChange('companyMessages', checked)}
              />
            </div>
          </Space>
        </Card>

        {/* Language & Region Settings */}
        <Card style={{ marginBottom: 24 }}>
          <Title level={4} style={{ marginBottom: 16 }}>
            <GlobalOutlined style={{ marginRight: 8 }} />
            Language & Region
          </Title>
          
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <Text strong>Language</Text>
                <br />
                <Text type="secondary">Choose your preferred language</Text>
              </div>
              <Select
                value={language}
                onChange={handleLanguageChange}
                style={{ width: 200 }}
                options={[
                  { value: 'en', label: 'English' },
                  { value: 'ms', label: 'Bahasa Malaysia' },
                  { value: 'zh', label: '中文' },
                  { value: 'ta', label: 'தமிழ்' }
                ]}
              />
            </div>
            
            <Divider style={{ margin: '12px 0' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <Text strong>Timezone</Text>
                <br />
                <Text type="secondary">Your local timezone for scheduling</Text>
              </div>
              <Select
                value={timezone}
                onChange={handleTimezoneChange}
                style={{ width: 200 }}
                options={[
                  { value: 'Asia/Kuala_Lumpur', label: 'Kuala Lumpur (GMT+8)' },
                  { value: 'Asia/Singapore', label: 'Singapore (GMT+8)' },
                  { value: 'Asia/Jakarta', label: 'Jakarta (GMT+7)' },
                  { value: 'Asia/Bangkok', label: 'Bangkok (GMT+7)' }
                ]}
              />
            </div>
          </Space>
        </Card>

        {/* Account Settings */}
        <Card>
          <Title level={4} style={{ marginBottom: 16 }}>
            <UserOutlined style={{ marginRight: 8 }} />
            Account
          </Title>
          
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <Text type="secondary">
                For account security settings, password changes, and data management, 
                please visit your profile page.
              </Text>
            </div>
            
            <div style={{ display: 'flex', gap: 12 }}>
              <Button type="primary" href="/profile">
                Go to Profile
              </Button>
              <Button href="/profile/security">
                Security Settings
              </Button>
            </div>
          </Space>
        </Card>
      </Content>
      <Footer />
    </Layout>
  );
}
