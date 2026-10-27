export interface RecaptchaResponse {
  success: boolean;
  challenge_ts: string;
  hostname: string;
  "error-codes"?: string[];
}

export interface RecaptchaResult {
  success: boolean;
  serviceError?: string;
}
