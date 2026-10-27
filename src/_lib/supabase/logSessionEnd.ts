'use server';

import { supabaseServer } from "./server";

export default async function logSessionEnd(sessionId: string) {
  const {error} = await supabaseServer
    .from("user_sessions")
    .update({
      logout_time: new Date().toISOString()
    })
    .eq("id", sessionId);

  if (error) {
    console.error("Failed to update logout time:", error)
    throw error;
  }
}
