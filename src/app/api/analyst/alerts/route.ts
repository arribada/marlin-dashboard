import { requireAnalyst } from "@/_lib/api/route-helpers";
import { fetchDB } from "@/_lib/database/client";
import { toCamelCase } from "@/_utils/formatting";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const result = await requireAnalyst(req, "analyst/alerts API");
  if (!result.ok) return result.response;

  const { searchParams } = req.nextUrl;
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!start || !end) {
    return Response.json({ error: "Missing required params: start, end" }, { status: 400 });
  }

  try {
    const data = await fetchDB("/analyst/alerts", { start, end });
    return Response.json(toCamelCase(data.recordings) ?? []);
  } catch (error) {
    console.error("[analyst/alerts API] DB request error:", error);
    return Response.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
