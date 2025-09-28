"use client";
import { useEffect, useState } from 'react';
import { Layout, Menu, Button, Space, Switch, Dropdown, theme as antdTheme, Avatar, Typography, Badge } from 'antd';
import Link from 'next/link';
import { BellOutlined } from '@ant-design/icons';
import dynamic from 'next/dynamic';
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
  const [notifs, setNotifs] = useState([]);
  const [notifTab, setNotifTab] = useState('direct');
  const unreadCount = notifs.filter(n => !n.read).length;


  const NotificationsDropdownContent = dynamic(() => import('./NotificationsDropdownContent'), { ssr: false, loading: () => <div style={{ padding: 12 }}>Loading...</div> });

  const fetchNotifs = async () => {
    try {
      const token = localStorage.getItem('jf_token');
      if (!token) return;
      const nr = await fetch(`${API_BASE_URL}/notifications?$limit=10&$sort[createdAt]=-1`, { headers: { 'Authorization': `Bearer ${token}` } });
      const njson = await nr.json();
      const items = Array.isArray(njson) ? njson : (njson?.data || []);
      setNotifs(items);
    } catch (_) {}
  };

  const markAllAsRead = async (ids) => {
    try {
      const token = localStorage.getItem('jf_token');
      const targets = Array.isArray(ids) && ids.length
        ? notifs.filter(n => ids.includes(n._id))
        : notifs.filter(n => !n.read && n._id);
      await Promise.all(targets.map(n => (
        fetch(`${API_BASE_URL}/notifications/${n._id}` , {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ read: true })
        })
      )));
      fetchNotifs();
    } catch (_) {}
  };

  // Moved statusTag and heavy dropdown UI into dynamic NotificationsDropdownContent
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
          // If not a student, detect admin; otherwise default to company
          try {
            const ar = await fetch(`${API_BASE_URL}/admin-dashboard/overview`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (ar.ok) {
              setRole('admin');
            } else {
              setRole('company');
            }
          } catch (_) { setRole('company'); }
        }
      } catch (_) {}
      // fetch notifications for dropdown (latest 10)
      try {
        const nr = await fetch(`${API_BASE_URL}/notifications?$limit=10&$sort[createdAt]=-1`, { headers: { 'Authorization': `Bearer ${token}` } });
        const njson = await nr.json();
        const items = Array.isArray(njson) ? njson : (njson?.data || []);
        setNotifs(items);
      } catch (_) {}
    })();
  }, []);

  const [notifOpen, setNotifOpen] = useState(false);
  const logoSrc = theme === 'dark' ? '/logo_rect_dark.svg' : '/logo_rect_light.svg';

  const menuItems = [
    { key: 'jobs', label: <Link href="/jobs" prefetch={false}>Jobs</Link> },
    { key: 'companies', label: <Link href="/companies" prefetch={false}>Companies</Link> },
  ];

  const userMenu = {
    items: role === 'admin' ? [
      { key: 'admin-dashboard', label: <Link href="/admin/dashboard" prefetch={false}>Dashboard</Link> },
      { key: 'admin-companies', label: <Link href="/admin/companies" prefetch={false}>Companies</Link> },
      { key: 'admin-renewals', label: <Link href="/admin/renewals" prefetch={false}>Renewal Requests</Link> },
      { key: 'logout', label: 'Logout', onClick: () => { localStorage.removeItem('jf_token'); window.location.reload(); } },
    ] : role === 'company' ? [
      { key: 'profile', label: <Link href="/company/profile" prefetch={false}>Profile</Link> },
      { key: 'applications', label: <Link href="/company/applications" prefetch={false}>Applications</Link> },
      { key: 'employees', label: <Link href="/company/employees" prefetch={false}>Employees</Link> },
      { key: 'universities', label: <Link href="/company/universities" prefetch={false}>Universities & Programmes</Link> },
      { key: 'create-job', label: <Link href="/company/jobs/new" prefetch={false}>Create Job</Link> },
      { key: 'logout', label: 'Logout', onClick: () => { localStorage.removeItem('jf_token'); window.location.reload(); } },
    ] : [
      { key: 'profile', label: <Link href="/profile" prefetch={false}>Profile</Link> },
      { key: 'applications', label: <Link href="/applications" prefetch={false}>Applications</Link> },
      { key: 'invitations', label: <Link href="/invitations" prefetch={false}>Invitations</Link> },
      { key: 'saved', label: <Link href="/saved-jobs" prefetch={false}>Saved Jobs</Link> },
      { key: 'liked', label: <Link href="/liked-jobs" prefetch={false}>Liked Jobs</Link> },
      { key: 'liked-companies', label: <Link href="/liked-companies" prefetch={false}>Liked Companies</Link> },
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
          {authed && (
            <Dropdown
              dropdownRender={() => (
                notifOpen ? (
                  <NotificationsDropdownContent
                    notifs={notifs}
                    token={typeof window !== 'undefined' ? localStorage.getItem('jf_token') : null}
                    onMarkAll={markAllAsRead}
                    notifTab={notifTab}
                    setNotifTab={setNotifTab}
                    onItemClick={(n) => { window.location.href = n.link || '/notifications'; }}
                    tokenColors={{ bg: token.colorBgElevated, border: token.colorBorder, primary: token.colorPrimary, radius: token.borderRadiusLG, shadow: token.boxShadowSecondary }}
                  />
                ) : (
                  <div style={{ width: 320, padding: 12 }}>Loading...</div>
                )
              )}
              onOpenChange={(o)=>{ setNotifOpen(o); if(o) fetchNotifs(); }}
              placement="bottomRight"
            >
              <Badge count={unreadCount} size="small">
                <Button type="text" icon={<BellOutlined />} />
              </Badge>
            </Dropdown>
          )}
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

