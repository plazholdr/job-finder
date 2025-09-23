"use client";
import { useState, useEffect, createContext, useContext } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export const ThemeContext = createContext({ theme: 'light', toggle: () => {} });
export function useTheme() { return useContext(ThemeContext); }

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light';
  return localStorage.getItem('jf_theme') || 'light';
}

export default function Providers({ children }) {
  const [client] = useState(() => new QueryClient());
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('jf_theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  const algorithm = theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm;
  const tokens = theme === 'dark'
    ? { colorBgLayout: '#0b1220', colorBgContainer: '#111827', colorText: '#e5e7eb', colorTextSecondary: '#9ca3af', colorBorder: '#1f2937', colorPrimary: '#1677ff' }
    : { colorBgLayout: '#f7f9fc', colorBgContainer: '#ffffff', colorText: '#0f172a', colorTextSecondary: '#475569', colorBorder: '#e5e7eb', colorPrimary: '#1677ff' };

  return (
    <ConfigProvider theme={{ algorithm, token: tokens }}>
      <QueryClientProvider client={client}>
        <ThemeContext.Provider value={{ theme, toggle: () => setTheme(t => t === 'dark' ? 'light' : 'dark') }}>
          {children}
        </ThemeContext.Provider>
      </QueryClientProvider>
    </ConfigProvider>
  );
}

