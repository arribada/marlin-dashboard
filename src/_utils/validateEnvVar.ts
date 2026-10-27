import type { Duration } from "@upstash/ratelimit";

type EnvVarTypeMap = {
  string: string;
  number: number;
  duration: Duration;
};

export default function validateEnvVar<T extends keyof EnvVarTypeMap>(
  name: string,
  type: T
): EnvVarTypeMap[T] {
  const value = process.env[name];

  if (value === undefined || value === null) {
    throw new Error(`[ENV] Missing required environment variable: ${name}`);
  }

  switch (type) {
    case "number":
      const parsed = parseInt(value as string, 10);
      if (isNaN(parsed)) {
        throw new Error(`[ENV] Environment variable ${name} must be a valid number, got: ${value}`);
      }
      return parsed as EnvVarTypeMap[T];

    case "duration":
      if (!/^\d+ (s|m|h|d)$/.test(value as string)) {
        throw new Error(
          `[ENV] Environment variable ${name} must be in the format "number unit" like "5 m", got: ${value}`
        );
      }
      return value as EnvVarTypeMap[T];

    case "string":
    default:
      return value as EnvVarTypeMap[T];
  }
}
