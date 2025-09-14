"use client";

import { useEffect } from "react";

export default function TokenHydrator() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const accessToken =
        localStorage.getItem("authToken") ||
        localStorage.getItem("companyToken") ||
        localStorage.getItem("token");

      if (accessToken) {
        const maxAge = 60 * 60 * 24 * 7; // 7 days
        // Sync into cookies so server routes can read immediately after refresh
        document.cookie = `authToken=${accessToken}; Path=/; Max-Age=${maxAge}`;
        document.cookie = `token=${accessToken}; Path=/; Max-Age=${maxAge}`;
        document.cookie = `companyToken=${accessToken}; Path=/; Max-Age=${maxAge}`;
      }
    } catch (e) {
      // no-op
    }
  }, []);

  return null;
}

