import { NextRequest, NextResponse } from "next/server";
import config from "@/config";

const API_BASE_URL = process.env.BACKEND_URL || config.api.baseUrl;

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.headers.get("authorization") || "";
    const body = await req.json().catch(() => ({}));

    const resp = await fetch(`${API_BASE_URL}/jobs/${params.id}/pic`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify(body),
    });

    const data = await resp.json().catch(() => ({}));
    return NextResponse.json(data, { status: resp.status });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Request failed" }, { status: 500 });
  }
}

