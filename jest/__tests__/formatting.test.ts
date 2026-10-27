import {
  formatDateThenTime,
  formatTimeThenDate,
  formatDateShortMonth,
  formatTimestampIntoTime,
  formatTimestampIntoDate,
  formatDuration,
  capitaliseAndSpace,
  getInitials,
  toCamelCase,
  toKebabCase,
  formatLat,
  formatLon,
  formatTimeAgo,
  formatBytes,
  escapeCell,
  joinArrayField,
  formatTime,
} from '../../src/_utils/formatting';

describe('formatDateThenTime', () => {
  it('should format a valid ISO string correctly', () => {
    const result = formatDateThenTime('2025-06-21T08:15:00Z');
    expect(result).toMatch(/21\/06\/25\n\d{2}:\d{2}/);
  });

  it('should format a Date object correctly', () => {
    const date = new Date('2025-06-21T08:15:00Z');
    const result = formatDateThenTime(date);
    expect(result).toMatch(/21\/06\/25\n\d{2}:\d{2}/);
  });

  it('should return "—" for null input', () => {
    expect(formatDateThenTime(null)).toBe('—');
  });

  it('should return "—" for undefined input', () => {
    expect(formatDateThenTime(undefined as any)).toBe('—');
  });

  it('should return "—" for empty string', () => {
    expect(formatDateThenTime('')).toBe('—');
  });
});

describe('formatTimeThenDate', () => {
  it('should format a valid ISO string', () => {
    const result = formatTimeThenDate('2025-06-21T08:15:00Z');
    expect(result).toMatch(/\d{2}:\d{2}\n21\/06\/25/);
  });

  it('should format a Date object correctly', () => {
    const date = new Date('2025-06-21T08:15:00Z');
    const result = formatTimeThenDate(date);
    expect(result).toMatch(/\d{2}:\d{2}\n21\/06\/25/);
  });

  it('should return "—" for null input', () => {
    expect(formatTimeThenDate(null)).toBe('—');
  });

  it('should display in local time', () => {
    const result = formatTimeThenDate('2025-12-31T23:59:00Z');
    expect(result).toContain('31/12/25');
  });
});

describe("formatTime", () => {
  it("formats a valid ISO string into HH:MM (en-GB, 24hr)", () => {
    expect(formatTime("2026-08-21T00:28:42Z")).toBe("01:28");
  });

  it("formats a valid Date object into HH:MM", () => {
    const date = new Date("2026-08-21T19:27:42Z");
    expect(formatTime(date)).toBe("20:27");
  });

  it("returns a dash for null", () => {
    expect(formatTime(null)).toBe("—");
  });

  it("returns a dash for an invalid ISO string", () => {
    expect(formatTime("not-a-real-date")).toBe("—");
  });

  it("returns a dash for an invalid Date object", () => {
    expect(formatTime(new Date("invalid"))).toBe("—");
  });

  it("pads single-digit hours and minutes with a leading zero", () => {
    expect(formatTime("2026-01-01T00:05:00Z")).toBe("00:05");
  });
});

describe('formatDateShortMonth', () => {
  it('should format date with short month name', () => {
    expect(formatDateShortMonth('2025-12-19T06:45:00')).toBe('19 Dec 2025');
  });

  it('should handle single digit days', () => {
    expect(formatDateShortMonth('2025-01-05T12:00:00')).toBe('5 Jan 2025');
  });

  it('should handle different months', () => {
    expect(formatDateShortMonth('2025-06-15T00:00:00')).toBe('15 Jun 2025');
  });
});

describe('formatTimestampIntoTime', () => {
  it('should format valid timestamp into 24-hour time', () => {
    expect(formatTimestampIntoTime('2025-02-10T09:00:00')).toMatch(/\d{2}:\d{2}/);
  });

  it('should return "—" for null input', () => {
    expect(formatTimestampIntoTime(null)).toBe('—');
  });

  it('should return "—" for undefined input', () => {
    expect(formatTimestampIntoTime(undefined)).toBe('—');
  });

  it('should return "—" for invalid date string', () => {
    expect(formatTimestampIntoTime('invalid-date')).toBe('—');
  });

  it('should handle midnight correctly', () => {
    const result = formatTimestampIntoTime('2025-02-10T00:00:00');
    expect(result).toMatch(/00:00/);
  });

  it('should handle afternoon times correctly', () => {
    const result = formatTimestampIntoTime('2025-02-10T14:30:00');
    expect(result).toMatch(/14:30/);
  });
});

describe('formatTimestampIntoDate', () => {
  it('should format valid timestamp into DD/MM/YYYY', () => {
    expect(formatTimestampIntoDate('2025-02-10T09:00:00')).toBe('10/02/2025');
  });

  it('should return "—" for null input', () => {
    expect(formatTimestampIntoDate(null)).toBe('—');
  });

  it('should return "—" for undefined input', () => {
    expect(formatTimestampIntoDate(undefined)).toBe('—');
  });

  it('should return "—" for invalid date string', () => {
    expect(formatTimestampIntoDate('not-a-date')).toBe('—');
  });

  it('should handle single digit days and months with leading zeros', () => {
    expect(formatTimestampIntoDate('2025-01-05T12:00:00')).toBe('05/01/2025');
  });
});

describe('formatDuration', () => {
  it('should format duration in minutes only', () => {
    expect(formatDuration('2025-09-01T18:45:00Z', '2025-09-01T18:55:00Z')).toBe('10 min');
  });

  it('should format duration with hours and minutes', () => {
    expect(formatDuration('2025-09-01T06:00:00Z', '2025-09-01T18:10:00Z')).toBe('12 hr 10 min');
  });

  it('should format duration with days, hours and minutes', () => {
    expect(formatDuration('2025-09-01T06:00:00Z', '2025-09-02T18:10:00Z')).toBe('1 d 12 hr 10 min');
  });

  it('should return "0min" for zero duration', () => {
    expect(formatDuration('2025-09-01T06:00:00Z', '2025-09-01T06:00:00Z')).toBe('0min');
  });

  it('should omit zero units', () => {
    expect(formatDuration('2025-09-01T06:00:00Z', '2025-09-01T06:45:00Z')).toBe('45 min');
  });

  it('should handle multiple days', () => {
    expect(formatDuration('2025-09-01T00:00:00Z', '2025-09-03T12:30:00Z')).toBe('2 d 12 hr 30 min');
  });

  it('should handle hours only (no minutes)', () => {
    expect(formatDuration('2025-09-01T06:00:00Z', '2025-09-01T09:00:00Z')).toBe('3 hr');
  });
});

describe('capitaliseAndSpace', () => {
  it('should convert snake_case to capitalised words', () => {
    expect(capitaliseAndSpace('bycatch_events')).toBe('Bycatch Events');
  });

  it('should handle single words', () => {
    expect(capitaliseAndSpace('vessel')).toBe('Vessel');
  });

  it('should handle multiple underscores', () => {
    expect(capitaliseAndSpace('trip_start_time')).toBe('Trip Start Time');
  });

  it('should handle existing spaces', () => {
    expect(capitaliseAndSpace('vessel name')).toBe('Vessel Name');
  });

  it('should handle mixed underscores and spaces', () => {
    expect(capitaliseAndSpace('vessel_id name')).toBe('Vessel Id Name');
  });

  it('should return empty string for null', () => {
    expect(capitaliseAndSpace(null)).toBe('');
  });

  it('should return empty string for undefined', () => {
    expect(capitaliseAndSpace(undefined)).toBe('');
  });

  it('should handle numbers', () => {
    expect(capitaliseAndSpace(123)).toBe('123');
  });

  it('should trim extra whitespace', () => {
    expect(capitaliseAndSpace('  vessel_name  ')).toBe('Vessel Name');
  });
});

describe('getInitials', () => {
  it('should get initials from two-word name', () => {
    expect(getInitials('John Smith')).toBe('JS');
  });

  it('should get single initial from one-word name', () => {
    expect(getInitials('Ada')).toBe('A');
  });

  it('should handle three or more words (first and last)', () => {
    expect(getInitials('Mary Jane Watson')).toBe('MW');
  });

  it('should handle extra whitespace', () => {
    expect(getInitials('  John   Smith  ')).toBe('JS');
  });

  it('should uppercase initials', () => {
    expect(getInitials('john smith')).toBe('JS');
  });

  it('should handle empty string', () => {
    expect(getInitials('')).toBe('');
  });

  it('should handle single character name', () => {
    expect(getInitials('A')).toBe('A');
  });
});

describe('toCamelCase', () => {
  it('should convert simple snake_case object', () => {
    const input = { vessel_id: 'A123', start_date: '2025-01-01' };
    const expected = { vesselId: 'A123', startDate: '2025-01-01' };
    expect(toCamelCase(input)).toEqual(expected);
  });

  it('should convert nested objects', () => {
    const input = { vessel_info: { vessel_id: 'A123', vessel_name: 'Explorer' } };
    const expected = { vesselInfo: { vesselId: 'A123', vesselName: 'Explorer' } };
    expect(toCamelCase(input)).toEqual(expected);
  });

  it('should convert arrays of objects', () => {
    const input = [{ vessel_id: 'A123' }, { vessel_id: 'B456' }];
    const expected = [{ vesselId: 'A123' }, { vesselId: 'B456' }];
    expect(toCamelCase(input)).toEqual(expected);
  });

  it('should leave non-object values unchanged', () => {
    expect(toCamelCase('string')).toBe('string');
    expect(toCamelCase(123)).toBe(123);
    expect(toCamelCase(true)).toBe(true);
    expect(toCamelCase(null)).toBe(null);
  });

  it('should handle empty objects', () => {
    expect(toCamelCase({})).toEqual({});
  });

  it('should handle empty arrays', () => {
    expect(toCamelCase([])).toEqual([]);
  });

  it('should handle deeply nested structures', () => {
    const input = {
      trip_data: {
        vessel_info: {
          vessel_id: 'A123',
        },
        catch_events: [{ species_name: 'Cod' }],
      },
    };
    const expected = {
      tripData: {
        vesselInfo: {
          vesselId: 'A123',
        },
        catchEvents: [{ speciesName: 'Cod' }],
      },
    };
    expect(toCamelCase(input)).toEqual(expected);
  });
});

describe('toKebabCase', () => {
  it('should convert spaces to hyphens and lowercase', () => {
    expect(toKebabCase('Ocean Explorer')).toBe('ocean-explorer');
  });

  it('should handle single words', () => {
    expect(toKebabCase('Vessel')).toBe('vessel');
  });

  it('should handle multiple spaces', () => {
    expect(toKebabCase('Royal   Navy')).toBe('royal-navy');
  });

  it('should trim whitespace', () => {
    expect(toKebabCase('  Ocean Explorer  ')).toBe('ocean-explorer');
  });

  it('should handle already lowercase', () => {
    expect(toKebabCase('ocean explorer')).toBe('ocean-explorer');
  });

  it('should handle mixed case', () => {
    expect(toKebabCase('OcEaN ExPlOrEr')).toBe('ocean-explorer');
  });
});

describe('formatLat', () => {
  it('should format positive latitude as North', () => {
    expect(formatLat(51.234)).toBe('51.23°N');
  });

  it('should format negative latitude as South', () => {
    expect(formatLat(-51.234)).toBe('51.23°S');
  });

  it('should format zero as North', () => {
    expect(formatLat(0)).toBe('0.00°N');
  });

  it('should round to 2 decimal places', () => {
    expect(formatLat(51.23456)).toBe('51.23°N');
  });

  it('should handle extreme latitudes', () => {
    expect(formatLat(90)).toBe('90.00°N');
    expect(formatLat(-90)).toBe('90.00°S');
  });
});

describe('formatLon', () => {
  it('should format positive longitude as East', () => {
    expect(formatLon(4.01)).toBe('4.01°E');
  });

  it('should format negative longitude as West', () => {
    expect(formatLon(-4.01)).toBe('4.01°W');
  });

  it('should format zero as East', () => {
    expect(formatLon(0)).toBe('0.00°E');
  });

  it('should round to 2 decimal places', () => {
    expect(formatLon(-4.01789)).toBe('4.02°W');
  });

  it('should handle extreme longitudes', () => {
    expect(formatLon(180)).toBe('180.00°E');
    expect(formatLon(-180)).toBe('180.00°W');
  });
});

describe('formatTimeAgo', () => {
  // Note: These tests use relative time, so we need to mock dates or use fixed comparisons

  it('should return "just now" for very recent timestamps', () => {
    const now = new Date();
    const recent = new Date(now.getTime() - 30 * 1000); // 30 seconds ago
    expect(formatTimeAgo(recent.toISOString())).toBe('just now');
  });

  it('should format minutes ago', () => {
    const now = new Date();
    const past = new Date(now.getTime() - 5 * 60 * 1000); // 5 minutes ago
    expect(formatTimeAgo(past.toISOString())).toBe('5 mins ago');
  });

  it('should format single minute ago', () => {
    const now = new Date();
    const past = new Date(now.getTime() - 1 * 60 * 1000); // 1 minute ago
    expect(formatTimeAgo(past.toISOString())).toBe('1 min ago');
  });

  it('should format hours ago', () => {
    const now = new Date();
    const past = new Date(now.getTime() - 3 * 60 * 60 * 1000); // 3 hours ago
    expect(formatTimeAgo(past.toISOString())).toBe('3 hours ago');
  });

  it('should format single hour ago', () => {
    const now = new Date();
    const past = new Date(now.getTime() - 1 * 60 * 60 * 1000); // 1 hour ago
    expect(formatTimeAgo(past.toISOString())).toBe('1 hour ago');
  });

  it('should format days ago', () => {
    const now = new Date();
    const past = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000); // 5 days ago
    expect(formatTimeAgo(past.toISOString())).toBe('5 days ago');
  });

  it('should format single day ago', () => {
    const now = new Date();
    const past = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000); // 1 day ago
    expect(formatTimeAgo(past.toISOString())).toBe('1 day ago');
  });

  it('should format months ago', () => {
    const now = new Date();
    const past = new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000); // ~45 days ago
    expect(formatTimeAgo(past.toISOString())).toBe('1 month ago');
  });

  it('should format years ago', () => {
    const now = new Date();
    const past = new Date(now.getTime() - 400 * 24 * 60 * 60 * 1000); // ~400 days ago
    expect(formatTimeAgo(past.toISOString())).toMatch(/\d+ years? ago/);
  });
});

describe("formatBytes", () => {
  describe("bytes", () => {
    it("formats 0 as bytes", () => expect(formatBytes(0)).toBe("0 B"));
    it("formats 1 as bytes", () => expect(formatBytes(1)).toBe("1 B"));
    it("formats 1023 as bytes", () => expect(formatBytes(1023)).toBe("1023 B"));
  });

  describe("kilobytes", () => {
    it("formats 1024 as 1.0 KB", () => expect(formatBytes(1024)).toBe("1.0 KB"));
    it("formats 1536 as 1.5 KB", () => expect(formatBytes(1536)).toBe("1.5 KB"));
    it("formats 1048575 as 1024.0 KB", () => expect(formatBytes(1048575)).toBe("1024.0 KB"));
  });

  describe("megabytes", () => {
    it("formats 1048576 as 1.0 MB", () => expect(formatBytes(1048576)).toBe("1.0 MB"));
    it("formats 1572864 as 1.5 MB", () => expect(formatBytes(1572864)).toBe("1.5 MB"));
    it("formats 10485760 as 10.0 MB", () => expect(formatBytes(10485760)).toBe("10.0 MB"));
  });
});

describe("escapeCell", () => {
  // Basic values
  it("returns an empty string for null", () => {
    expect(escapeCell(null)).toBe("");
  });

  it("returns an empty string for undefined", () => {
    expect(escapeCell(undefined)).toBe("");
  });

  it("returns a plain string unchanged", () => {
    expect(escapeCell("hello")).toBe("hello");
  });

  it("coerces numbers to strings", () => {
    expect(escapeCell(42)).toBe("42");
  });

  it("coerces booleans to strings", () => {
    expect(escapeCell(true)).toBe("true");
  });

  // RFC 4180 quoting
  it("wraps a value containing a comma in double-quotes", () => {
    expect(escapeCell("hello, world")).toBe('"hello, world"');
  });

  it("wraps a value containing a double-quote in double-quotes and escapes it", () => {
    expect(escapeCell('say "hi"')).toBe('"say ""hi"""');
  });

  it("wraps a value containing a newline in double-quotes", () => {
    expect(escapeCell("line1\nline2")).toBe('"line1\nline2"');
  });

  it("wraps a value containing a carriage return in double-quotes", () => {
    expect(escapeCell("line1\rline2")).toBe('"line1\rline2"');
  });

  it("handles a value with both a comma and a double-quote", () => {
    expect(escapeCell('Vessel "Northern Star", HMS')).toBe(
      '"Vessel ""Northern Star"", HMS"'
    );
  });

  it("escapes multiple double-quotes within the same value", () => {
    expect(escapeCell('a "b" and "c"')).toBe('"a ""b"" and ""c"""');
  });

  // Formula injection
  it("prefixes a value starting with = with a tab", () => {
    expect(escapeCell("=SUM(A1)")).toBe("\t=SUM(A1)");
  });

  it("prefixes a value starting with + with a tab", () => {
    expect(escapeCell("+1234")).toBe("\t+1234");
  });

  it("prefixes a value starting with - with a tab", () => {
    expect(escapeCell("-1234")).toBe("\t-1234");
  });

  it("prefixes a value starting with @ with a tab", () => {
    expect(escapeCell("@SUM(A1)")).toBe("\t@SUM(A1)");
  });

  it("quotes a formula cell that also contains a comma", () => {
    expect(escapeCell("=SUM(A1,B1)")).toBe('"\t=SUM(A1,B1)"');
  });

  it("does not prefix a value that merely contains = but does not start with it", () => {
    expect(escapeCell("total=100")).toBe("total=100");
  });
});

describe("joinArrayField", () => {
  it("returns an empty string for an empty array", () => {
    expect(joinArrayField([])).toBe("");
  });

  it("returns the single value unchanged for a one-element array", () => {
    expect(joinArrayField(["AAA"])).toBe("AAA");
  });

  it("joins two values with a pipe delimiter", () => {
    expect(joinArrayField(["AAA", "BBB"])).toBe("AAA|BBB");
  });

  it("joins multiple values with a pipe delimiter", () => {
    expect(joinArrayField(["AAA", "BBB", "CCC"])).toBe("AAA|BBB|CCC");
  });
});
