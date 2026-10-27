import { ICES_DIVISIONS_URL } from "@/_lib/constants";

export async function GET() {
  try {
    const res = await fetch(ICES_DIVISIONS_URL);
    if (!res.ok) throw new Error(`ICES responded with ${res.status}`);
    const data = await res.json();
    return Response.json(data);
  } catch (err) {
    console.error('ICES proxy error:', err);
    return Response.json({ error: 'Failed to fetch ICES data' }, { status: 502 });
  }
}
