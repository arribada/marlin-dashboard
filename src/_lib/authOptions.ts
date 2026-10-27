import CredentialsProvider from "next-auth/providers/credentials";
import { supabaseServer } from "@/_lib/supabase/server";
import { compare } from "bcrypt";
import { NextAuthOptions } from "next-auth";
import { headers } from "next/headers";
import { checkLoginRateLimit } from "./supabase/loginRateLimiter";
import { verifyRecaptcha } from "./recaptcha";
import validateEnvVar from "../_utils/validateEnvVar";

const regularMaxAge = validateEnvVar("NEXTAUTH_SESSION_MAX_AGE", "number");
const adminMaxAge = validateEnvVar("NEXTAUTH_ADMIN_SESSION_MAX_AGE", "number");

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      credentials: {
        email: {},
        password: {},
        recaptchaToken: {}
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Retrieves the user's IP address from request headers and constructs a
        // unique identifier for rate limiting.
        const headersList = await headers();
        const ip = headersList.get("x-forwarded-for") || "unknown";
        const identifier = `${credentials.email.toLowerCase()}||${ip}`;

        // Verify reCAPTCHA if token is provided and after rate limit triggered
        let recaptchaVerified = false;
        if (credentials.recaptchaToken) {
          const { success, serviceError } = await verifyRecaptcha(credentials.recaptchaToken);

          // Throws errors intentionally to bubble up to the form
          // and allow the UI to display the specific message to the user.
          if (!success) {
            if (serviceError === "reCAPTCHCA service unavailable") {
              throw new Error("reCAPTCHA service unavailable. Please try again later.");
            }

            if (serviceError === "timeout-or-duplicate") {
              throw new Error("reCAPTCHA token expired. Please refresh your page to try again.");
            }
            // Otherwise, user failed the reCAPTCHA challenge
            throw new Error("reCAPTCHA verification failed.");
          }
          recaptchaVerified = true;
        }

        await checkLoginRateLimit(identifier, recaptchaVerified);

        // Fetch user from Supabase
        const { data: user, error: fetchUserError } = await supabaseServer
          .from("users")
          .select("*")
          .eq("email", credentials.email)
          .maybeSingle();

        if (fetchUserError) {
          console.error(
            "[ERROR] Failed to fetch user during login lookup",
            { maskEmail: credentials.email, supabaseError: fetchUserError }
          );
          throw new Error("We couldn't complete your login. Please try again later.");
        }

        if (!user) {
          console.warn(
            "[WARN] Login attempted with unknown email",
            { maskEmail: credentials.email }
          );
          throw new Error("Invalid credentials");
        }

        const isValid = await compare(credentials?.password, user.password_hash);
        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        // Create new session in Supabase
        const { data: sessionRow, error: logSessionError } = await supabaseServer
          .from("user_sessions")
          .insert({
            user_id: user.id,
            email: credentials.email,
            ip_address: ip,
            session_method: "credentials",
          })
          .select("id")
          .single()

        if (logSessionError) {
          console.error(
            "[ERROR] Failed to log user session",
            { maskEmail: credentials.email, supabaseError: logSessionError }
          );
          throw new Error("We couldn't complete your login. Please try again later.");
        }

        return {
          id: user.id,
          email: user.email,
          name: `${user.first_name} ${user.last_name}`,
          role: user.role,
          vesselId: user.vessel_id,
          sessionId: sessionRow?.id,
        };
      },
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: regularMaxAge,
  },
  jwt: {
    maxAge: regularMaxAge,
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      const safeBaseUrl = baseUrl || "http://localhost:3000"

      if (url.startsWith("/")) return `${safeBaseUrl}${url}`
      else if (new URL(url).origin === safeBaseUrl) return url
      return safeBaseUrl
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.role = user.role;
        token.vesselId = user.vesselId ?? null;
        token.sessionId = user.sessionId;

        const now = Math.floor(Date.now() / 1000);
        if (user.role === 'admin') {
          token.exp = now + adminMaxAge
        } else {
          token.exp = now + regularMaxAge;
        }
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        id: token.sessionId,
        user: {
          ...session.user,
          id: token.id,
          name: token.name ?? "No name available",
          role: token?.role ?? "regular",
        },
      };
    },
  },
  pages: {
    signIn: "/login"
  }
}
