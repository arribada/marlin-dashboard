import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "../redis";
import { supabaseServer } from "@/_lib/supabase/server";
import validateEnvVar from "../../_utils/validateEnvVar";

const loginRateLimitCount = validateEnvVar("LOGIN_RATE_LIMIT_COUNT", "number");
const loginRateLimitWindow = validateEnvVar("LOGIN_RATE_LIMIT_WINDOW", "duration");

// Initializes the rate limiter with the specified count and window
export const loginRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(loginRateLimitCount, loginRateLimitWindow)
});

// Enforces the login rate limit for a given identifier
// Logs attempts to the database if the limit is exceeded
export async function checkLoginRateLimit(identifier: string, recaptchaVerified = false) {

  // Skip rate limiting if reCAPTCHA was successfully solved
  if (recaptchaVerified) return { success: true };

  let rateLimitResult = { success: true };

  try {
    rateLimitResult = await loginRateLimiter.limit(identifier);
  } catch (err) {
    console.error(
      "[ERROR] Rate limiter unreachable - allowing login but rate limiting is bypassed",
       err
    );
    // 'Fail-open' allow login if Redis is unavailable
    rateLimitResult = { success: true };
  }

  if (rateLimitResult.success) return rateLimitResult;

  console.warn(`Rate limit exceeded for identifier: ${identifier}`);

  const [email, ip] = identifier.split("||");

  try {
    const { error } = await supabaseServer.from("login_attempts").insert({
      email,
      ip,
      identifier,
      created_at: new Date().toISOString()
    });

    if (error) console.error("Failed to log login attempt:", error);

  } catch (dbError) {
    console.error("Failed to log login attempt:", dbError);
  }

  throw new Error("Too many login attempts. Please complete the reCAPTCHA challenge to continue.");
}
