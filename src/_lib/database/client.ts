import validateEnvVar from "@/_utils/validateEnvVar";

const DB_USER = validateEnvVar("DB_USER", "string");
const DB_PASS = validateEnvVar("DB_PASS", "string");
const DB_API_URL = validateEnvVar("DB_API_URL", "string");

const AUTH_HEADER =
  "Basic " + Buffer.from(`${DB_USER}:${DB_PASS}`).toString("base64");

export async function fetchDB<T = any>(
  path: string,
  params?: Record<string, string | string[] | undefined>
): Promise<T> {
  const url = new URL(path, DB_API_URL);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined) return;
      if (Array.isArray(value)) {
        url.searchParams.set(key, value.join(","));
      } else {
        url.searchParams.set(key, value);
      }
    });
  }

  const res = await fetch(url, { headers: { Authorization: AUTH_HEADER } });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || `DB request failed: ${res.status}`);
  }

  return res.json();
}
