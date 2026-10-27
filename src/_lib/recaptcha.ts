import { RecaptchaResult, RecaptchaResponse } from "@/_types/recaptcha";
import validateEnvVar from "../_utils/validateEnvVar";

const secretKey = validateEnvVar("RECAPTCHA_SECRET_KEY", "string");
validateEnvVar("NEXT_PUBLIC_RECAPTCHA_SITE_KEY", "string");

export async function verifyRecaptcha(token: string): Promise<RecaptchaResult> {
  try {
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `secret=${secretKey}&response=${token}`,
    });

    if (!response.ok) {
      return {
        success: false,
        serviceError: `reCAPTCHA verification failed with status: ${response.status}`
      };
    }

    const data: RecaptchaResponse = await response.json();

    return {
      success: data.success,
      serviceError: data.success ? undefined : (data["error-codes"]?.join(", ") || "unknown error")
    };
  } catch (error) {
    console.error("reCAPTCHA network/service error:", error);
    return {
      success: false,
      serviceError: 'reCAPTCHCA service unavailable'
    };
  }
}
