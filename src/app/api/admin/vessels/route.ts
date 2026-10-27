import { requireAdmin } from "@/_lib/api/route-helpers";
import { fetchDB } from "@/_lib/database/client";
import { toCamelCase } from "@/_utils/formatting";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const result = await requireAdmin(req, "admin/vessels API");
  if (!result.ok) return result.response;

  const minimal = req.nextUrl.searchParams.get("fields") === "minimal";

  try {
    const data = await fetchDB("/admin/vessels", minimal ? { minimal: "true" } : {});
    return Response.json(toCamelCase(data.admin_vessels));
  } catch (error) {
    console.error("[admin/vessels API] DB request error:", error);
    return Response.json({ error: "Failed to fetch trip history data" }, { status: 500 });
  };
}
