import { NextRequest } from "next/server";
import { toCamelCase } from "@/_utils/formatting";
import { requireFisher } from "@/_lib/api/route-helpers";
import { fetchDB } from "@/_lib/database/client";

export async function GET(req: NextRequest) {
  const result = await requireFisher(req, "fisher/alerts API");
  if (!result.ok) return result.response;

  const { searchParams } = req.nextUrl;
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!start || !end) {
    return Response.json({ error: "Missing required params: start, end" }, { status: 400 });
  }

  try {
    const data = await fetchDB("/fisher/map", { start, end });
    return Response.json(toCamelCase(data.recordings) ?? []);
  } catch (error) {
    console.error("[fisher/map API] DB request error:", error);
    return Response.json({ error: "Failed to fetch map data" }, { status: 500 });
  }
}
