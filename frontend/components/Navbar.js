"use client";
import { useEffect, useState } from 'react';
import { Layout, Menu, Button, Space, Switch, Dropdown, theme as antdTheme, Avatar, Typography } from 'antd';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from './Providers';
import { API_BASE_URL } from '../config';

export default function Navbar() {
  const { theme, toggle } = useTheme();
  const { token } = antdTheme.useToken();
  const [authed, setAuthed] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [role, setRole] = useState('');
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('jf_token') : null;
    setAuthed(!!token);
    if (!token) return;
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/student/internship/me`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          const fn = data?.profile?.firstName || '';
          const ln = data?.profile?.lastName || '';
          const name = `${fn} ${ln}`.trim() || 'Student';
          setDisplayName(name);
          setAvatarUrl(data?.profile?.avatar || '');
          setRole('student');
        } else {
          setRole('company');
        }
      } catch (_) {}
    })();
  }, []);

  const logoSrc = theme === 'dark' ? '/logo_rect_dark.svg' : '/logo_rect_light.svg';

  const menuItems = [
    { key: 'jobs', label: <Link href="/jobs">Jobs</Link> },
    { key: 'companies', label: <Link href="/companies">Companies</Link> },
  ];

  const userMenu = {
    items: role === 'company' ? [
      { key: 'profile', label: <Link href="/company/profile">Profile</Link> },
      { key: 'logout', label: 'Logout', onClick: () => { localStorage.removeItem('jf_token'); window.location.reload(); } },
    ] : [
      { key: 'saved', label: <Link href="/saved-jobs">Saved Jobs</Link> },
      { key: 'liked', label: <Link href="/liked-jobs">Liked Jobs</Link> },
      { key: 'logout', label: 'Logout', onClick: () => { localStorage.removeItem('jf_token'); window.location.reload(); } },
    ]
  };

  return (
    <Layout.Header style={{ background: token.colorBgContainer, borderBottom: `1px solid ${token.colorBorder}`, padding: '0 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%', maxWidth: 1200, margin: '0 auto' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', marginRight: 24 }}>
          <Image src={logoSrc} alt="Job Finder" width={128} height={32} priority />
        </Link>
        <Menu theme={theme === 'dark' ? 'dark' : 'light'} mode="horizontal" selectable={false} style={{ flex: 1, background: 'transparent' }} items={menuItems} />
        <Space>
          <span style={{ color: token.colorText }}>Dark</span>
          <Switch checked={theme === 'dark'} onChange={toggle} />
          {authed ? (
            <Dropdown menu={userMenu} placement="bottomRight">
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <Avatar size={28} src={avatarUrl || undefined} style={{ backgroundColor: token.colorPrimary }}>
                  {(displayName || 'U').charAt(0).toUpperCase()}
                </Avatar>
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                  <Typography.Text style={{ margin: 0 }}>
                    {displayName || 'Account'}
                  </Typography.Text>
                  <Typography.Text type="secondary" style={{ fontSize: 12, margin: 0 }}>
                    {role ? role.charAt(0).toUpperCase() + role.slice(1) : ''}
                  </Typography.Text>
                </div>
              </div>
            </Dropdown>
          ) : (
            <>
              <Link href="/login"><Button>Sign in</Button></Link>
              <Link href="/register"><Button type="primary">Sign up</Button></Link>
            </>
          )}
        </Space>
      </div>
    </Layout.Header>
  );
}

