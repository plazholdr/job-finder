"use client";
import { useEffect, useState } from 'react';
import { Layout, Menu, Button, Space, Switch, Dropdown, theme as antdTheme, Avatar, Typography, Badge, Tabs, List, Tag } from 'antd';
import Link from 'next/link';
import { BellOutlined } from '@ant-design/icons';
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

  const directNotifs = notifs.filter(n => (n.channel || n.type || 'direct') !== 'watching');
  const watchingNotifs = notifs.filter(n => (n.channel || n.type) === 'watching');

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

  const statusTag = (n) => {
    const s = (n?.status || n?.state || '').toString().toLowerCase();
    const map = {
      'in progress': { text: 'In progress', color: 'blue' },
      'in_progress': { text: 'In progress', color: 'blue' },
      'action needed': { text: 'Action needed', color: 'orange' },
      'action_needed': { text: 'Action needed', color: 'orange' },
      'completed': { text: 'Completed', color: 'green' },
      'rejected': { text: 'Rejected', color: 'red' },
      'pending': { text: 'Pending', color: 'blue' },
      'active': { text: 'Active', color: 'green' },
    };
    const m = map[s];
    return m ? <Tag color={m.color}>{m.text}</Tag> : null;
  };
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
      // fetch notifications for dropdown (latest 10)
      try {
        const nr = await fetch(`${API_BASE_URL}/notifications?$limit=10&$sort[createdAt]=-1`, { headers: { 'Authorization': `Bearer ${token}` } });
        const njson = await nr.json();
        const items = Array.isArray(njson) ? njson : (njson?.data || []);
        setNotifs(items);
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
      { key: 'create-job', label: <Link href="/company/jobs/new">Create Job</Link> },
      { key: 'logout', label: 'Logout', onClick: () => { localStorage.removeItem('jf_token'); window.location.reload(); } },
    ] : [
      { key: 'profile', label: <Link href="/profile">Profile</Link> },
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
          {authed && (
            <Dropdown
              dropdownRender={() => (
                <div style={{ width: 420, background: token.colorBgElevated, borderRadius: token.borderRadiusLG, boxShadow: token.boxShadowSecondary, boxSizing: 'border-box' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding: '8px 12px', fontWeight: 600, borderBottom: `1px solid ${token.colorBorder}` }}>
                    <span>Notifications</span>
                    <Button type="link" size="small" onClick={markAllAsRead}>Mark all as read</Button>
                  </div>
                  <Tabs size="small" activeKey={notifTab} onChange={setNotifTab} items={[
                    { key: 'direct', label: 'Direct', children: (
                      <div style={{ maxHeight: 420, overflowY: 'auto', padding: '8px 8px' }}>
                        <List size="small" split={false} dataSource={directNotifs} renderItem={(n) => (
                          <List.Item key={n._id} style={{ cursor:'pointer', padding: '8px 8px' }} onClick={() => { window.location.href = n.link || '/notifications'; }}>
                            <div style={{ display:'flex', gap: 8, width:'100%' }}>
                              <span style={{ width:8, height:8, marginTop: 6, flexShrink:0, borderRadius:'50%', backgroundColor: n.read ? token.colorBorder : token.colorPrimary, display:'inline-block' }} />
                              <div style={{ flex: 1 }}>
                                <div style={{ display:'flex', justifyContent:'space-between', gap: 12 }}>
                                  <Space size={6} wrap>
                                    {!n.read && <Tag color="blue">Unread</Tag>}
                                    <Typography.Text strong>{n.title || n.message || 'Notification'}</Typography.Text>
                                    {statusTag(n)}
                                  </Space>
                                  <Space size={8} wrap>
                                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                                      {new Date(n.createdAt || Date.now()).toLocaleString()}
                                    </Typography.Text>
                                    {!n.read && <Button size="small" type="link" onClick={(e)=>{ e.stopPropagation(); markAllAsRead([n._id]); }}>Mark as read</Button>}
                                  </Space>
                                </div>
                                {(n.body || n.message) && <Typography.Text type="secondary">{n.body || n.message}</Typography.Text>}
                              </div>
                            </div>
                          </List.Item>
                        )} />
                      </div>
                    ) },
                    { key: 'watching', label: 'Watching', children: (
                      <div style={{ maxHeight: 420, overflowY: 'auto', padding: '8px 8px' }}>
                        <List size="small" split={false} dataSource={watchingNotifs} renderItem={(n) => (
                          <List.Item key={n._id} style={{ cursor:'pointer', padding: '8px 8px' }} onClick={() => { window.location.href = n.link || '/notifications'; }}>
                            <div style={{ display:'flex', gap: 8, width:'100%' }}>
                              <span style={{ width:8, height:8, marginTop: 6, flexShrink:0, borderRadius:'50%', backgroundColor: n.read ? token.colorBorder : token.colorPrimary, display:'inline-block' }} />
                              <div style={{ flex: 1 }}>
                                <div style={{ display:'flex', justifyContent:'space-between', gap: 12 }}>
                                  <Space size={6} wrap>
                                    {!n.read && <Tag color="blue">Unread</Tag>}
                                    <Typography.Text strong>{n.title || n.message || 'Notification'}</Typography.Text>
                                    {statusTag(n)}
                                  </Space>
                                  <Space size={8} wrap>
                                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                                      {new Date(n.createdAt || Date.now()).toLocaleString()}
                                    </Typography.Text>
                                    {!n.read && <Button size="small" type="link" onClick={(e)=>{ e.stopPropagation(); markAllAsRead([n._id]); }}>Mark as read</Button>}
                                  </Space>
                                </div>
                                {(n.body || n.message) && <Typography.Text type="secondary">{n.body || n.message}</Typography.Text>}
                              </div>
                            </div>
                          </List.Item>
                        )} />
                      </div>
                    ) },
                  ]} />
                  <div style={{ position:'sticky', bottom: 0, background: token.colorBgElevated, borderTop: `1px solid ${token.colorBorder}`, padding: 8, textAlign: 'center' }}>
                    <Link href="/notifications">View all</Link>
                  </div>
                </div>
              )}
              onOpenChange={(o)=>{ if(o) fetchNotifs(); }}
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

