"use client";
import { theme as antdTheme } from "antd";
import Image from "next/image";
import Link from "next/link";

export default function RegistrationHeader() {
  const { token } = antdTheme.useToken();
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      background: token.colorBgContainer,
      borderBottom: `1px solid ${token.colorBorder}`
    }}>
      <div style={{ width: "100%", margin: 0, padding: "8px 24px", display: "flex", alignItems: "center" }}>
        <Link href="/" prefetch={false} style={{ display: "inline-flex", alignItems: "center" }}>
          <Image src="/logo_rect_light.svg" alt="Job Finder" width={128} height={32} priority />
        </Link>
      </div>
    </div>
  );
}

