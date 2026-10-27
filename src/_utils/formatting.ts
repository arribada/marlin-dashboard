/**
 * Formats a timestamp into a neat "DD/MM/YY HH:MM" string.
 * - Accepts either a Date object or ISO string.
 * - Returns a dash ("-") if the value is null or invalid.
 * - Outputs in UK (en-GB) format.
 *
 * Example:
 *   formatDateThenTime("2025-06-21T08:15:00Z") → "21/06/25\n09:15"
 */
export function formatDateThenTime(timestamp: string | Date | null) {
  if (!timestamp) return "—";

  const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;

  const datePart = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });

  const timePart = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${datePart}\n${timePart}`;
}

/**
 * Formats a timestamp into a neat "HH:MM DD/MM/YY" string.
 * - Accepts either a Date object or ISO string.
 * - Returns a dash ("—") if the value is null or invalid.
 * - Outputs in UK (en-GB) format.
 *
 * Example:
 *   formatTimeThenDate("2025-06-21T08:15:00Z") → "09:15\n21/06/25"
 */
export function formatTimeThenDate(timestamp: string | Date | null) {
  if (!timestamp) return "—";

  const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;

  const datePart = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit"
  });

  const timePart = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit"
  });

  return `${timePart}\n${datePart}`;
}

/**
 * Formats a timestamp into a neat "HH:MM" string.
 * - Accepts either a Date object or ISO string.
 * - Returns a dash ("—") if the value is null or invalid.
 * - Outputs in UK (en-GB) format.
 *
 * Example:
 *   formatTime("2026-08-21T00:28:42Z") → "01:28"
 */
export function formatTime(value: string | Date | null): string {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Formats a date string into a human-readable format: "Mon DD, YYYY".
 *
 * Example:
 *   formatDateShortMonth("2025-12-19T06:45:00") → "19 Dec 2025"
 */
export function formatDateShortMonth(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Formats a timestamp into time only format: "HH:MM" (24-hour).
 * - Accepts an ISO string timestamp.
 * - Returns a dash ("—") if the value is null or invalid.
 * - Outputs in UK (en-GB) format.
 *
 * Example:
 *   formatTimestampIntoTime("2025-02-10T09:00:00") → "09:00"
 *   formatTimestampIntoTime(null) → "—"
 */
export const formatTimestampIntoTime = (timestamp: string | Date | null | undefined) => {
  if (!timestamp) return "—";

  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  if (isNaN(date.getTime())) return "—";

  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

/**
 * Formats a timestamp into date format: "DD/MM/YYYY".
 * - Accepts an ISO string timestamp.
 * - Returns a dash ("—") if the value is null or invalid.
 * - Outputs in UK (en-GB) format.
 *
 * Example:
 *   formatTimestampIntoDate("2025-02-10T09:00:00") → "10/02/2025"
 *   formatTimestampIntoDate(null) → "—"
 */
export const formatTimestampIntoDate = (timestamp: string | null | undefined) => {
  if (!timestamp) return "—";

  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return "—";

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Calculates duration between two timestamp strings and returns a
 * human-readable format such as:
 * - "10min"
 * - "12hr 10min"
 * - "1d 12hr 10min"
 *
 * Rules:
 * - Omit units that are zero.
 * - If only minutes exist, show only minutes.
 * - If days or hours exist, include them.
 *
 * Example:
 *   formatDuration("2025-09-01T18:45:00Z", "2025-09-01T18:55:00Z") → "10min"
 *   formatDuration("2025-09-01T06:00:00Z", "2025-09-01T18:10:00Z") → "12hr 10min"
 *   formatDuration("2025-09-01T06:00:00Z", "2025-09-02T18:10:00Z") → "1d 12hr 10min"
 */
export function formatDuration(start: string, end: string): string {
  const diffMs = new Date(end).getTime() - new Date(start).getTime();
  const totalMinutes = Math.floor(diffMs / 60000);

  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  const parts = [];

  if (days > 0) parts.push(`${days} d`);
  if (hours > 0) parts.push(`${hours} hr`);
  if (minutes > 0) parts.push(`${minutes} min`);

  // If everything is zero, show "0min"
  if (parts.length === 0) return "0min";

  return parts.join(" ");
}

/**
 * Converts snake_case or lowercase strings into human-readable,
 * capitalised text with spaces.
 *
 * Example:
 *   capitaliseAndSpace("bycatch_events") → "Bycatch Events"
 */
export function capitaliseAndSpace(value: unknown): string {
  if (value == null) return "";

  return String(value)
    .replace(/[_\s]+/g, " ")
    .trim()
    .replace(/\b\w/g, char => char.toUpperCase());
}

/**
 * Derives uppercase initials from a name string.
 * Handles multiple words and extra whitespace.
 *
 * Example:
 *   getInitials("John Smith") → "JS"
 *   getInitials("Ada") → "A"
 */
export function getInitials(name: string): string {
  const names = name.trim().split(/\s+/);
  const first = names[0]?.[0] || "";
  const last = names.length > 1 ? names[names.length - 1][0] : "";
  return (first + last).toUpperCase();
}

/**
 * Converts a snake_case string into camelCase.
 *
 * Example:
 *   toCamel("start_date") → "startDate"
 */
function toCamel(s: string) {
  return s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

/**
 * Iterates over all object keys and converts them from snake_case to camelCase.
 * - Works for objects, arrays, and nested structures.
 * - Leaves non-object values (strings, numbers, booleans, etc.) unchanged.
 *
 * Useful for normalising data returned from Supabase or APIs
 * that use snake_case naming conventions.
 *
 * Example:
 *   toCamelCase({ vessel_info: { vessel_id: "A123" } })
 *     → { vesselInfo: { vesselId: "A123" } }
 */
export function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  }

  if (obj && typeof obj === "object" && obj.constructor === Object) {
    const newObj: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      newObj[toCamel(key)] = toCamelCase(value);
    }
    return newObj;
  }

  return obj;
}

/**
 * Format a string into a stable kebab-case string.
 * Converts spaces to hyphens and lowercases the result.
 * Example: "Ocean Explorer" → "ocean-explorer"
 */
export function toKebabCase(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");
}

/**
 * Format latitude as a human-readable string with N/S direction.
 * Positive = North (N), Negative = South (S).
 * Example: 51.234 → "51.234°N"
 */
export const formatLat = (lat: number) => {
  const dir = lat >= 0 ? "N" : "S";
  return `${Math.abs(lat).toFixed(2)}°${dir}`;
};

/**
 * Format longitude as a human-readable string with E/W direction.
 * Positive = East (E), Negative = West (W).
 * Example: -4.01 → "4.01°W"
 */
export const formatLon = (lon: number) => {
  const dir = lon >= 0 ? "E" : "W";
  return `${Math.abs(lon).toFixed(2)}°${dir}`;
};

/**
 * Formats a timestamp as relative time (e.g., "5 mins ago", "2 hours ago")
 * @param {string|Date} timestamp - The timestamp to format
 * @returns {string} Formatted relative time string
 */
export function formatTimeAgo(timestamp: string) {
  const now = new Date();
  const past = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? "min" : "mins"} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} ${diffInMonths === 1 ? "month" : "months"} ago`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} ${diffInYears === 1 ? "year" : "years"} ago`;
}

/** Formats a byte size into a human-readable string with appropriate units (B, KB, MB).
 * - If bytes < 1024, shows in bytes (e.g., "500 B").
 * - If bytes < 1 MB, shows in kilobytes with one decimal (e.g., "1.5 KB").
 * - If bytes >= 1 MB, shows in megabytes with one decimal (e.g., "2.3 MB").
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// --- CSV helpers ---

/**
 * Escapes a single cell value:
 * - Wraps in double-quotes if the value contains a comma, double-quote, or newline
 * - Escapes internal double-quotes by doubling them (" -> "")
 * - Sanitises formula injection by prefixing dangerous leading characters with a tab
 */
export function escapeCell(value: unknown): string {
  const str = value === null || value === undefined ? "" : String(value);

  const sanitised = /^[=+\-@]/.test(str) ? `\t${str}` : str;

  if (/[,"\n\r]/.test(sanitised)) {
    return `"${sanitised.replace(/"/g, '""')}"`;
  }

  return sanitised;
}

/**
 * Serialises a multi-value array field using a pipe delimiter so the joined
 * string never embeds a comma, keeping every row correctly aligned.
 *
 *   ["AAA", "BBB"]  →  cell value  →  AAA|BBB
 */
export function joinArrayField(values: string[]): string {
  return values.join("|");
}

// TEMPORARY: strips timestamp markers embedded in transcriptContent
// (e.g. "[  0s->13.64s] some text").
// Can remove once backend finalises the transcript format to exclude these
export function stripTimestampMarkers(content: string): string {
  return content
    .replace(/\[\s*[\d.]+s\s*->\s*[\d.]+s\]/g, "")
    .replace(/\n+/g, " ")
    .trim();
}
