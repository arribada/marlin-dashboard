'use client';

import { signOut } from "next-auth/react";
import logSessionEnd from "../_lib/supabase/logSessionEnd";

export const handleSignOut = async (sessionId?: string | null) => {
  if (sessionId) {
    logSessionEnd(sessionId).catch(err =>
      console.error("Failed to log session end:", err)
    );
  }

  try {
    await signOut({ redirect: true, callbackUrl: "/login" });
  } catch (error) {
    console.error("Sign out failed:", error);
    window.location.href = "/login"
  }
}
