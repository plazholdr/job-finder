"use client";
import { useEffect, useState } from 'react';
import { Layout, Menu, Button, Space, Switch, Dropdown, theme as antdTheme } from 'antd';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from './Providers';

export default function Navbar() {
  const { theme, toggle } = useTheme();
  const { token } = antdTheme.useToken();
  const [authed, setAuthed] = useState(false);
  useEffect(() => { setAuthed(!!localStorage.getItem('jf_token')); }, []);

  const logoSrc = theme === 'dark' ? '/logo_rect_dark.svg' : '/logo_rect_light.svg';

  const menuItems = [
    { key: 'jobs', label: <Link href="/jobs">Jobs</Link> },
    { key: 'companies', label: <Link href="/companies">Companies</Link> },
  ];

  const userMenu = {
    items: [
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
              <Button>Account</Button>
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

