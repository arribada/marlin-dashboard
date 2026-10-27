'use client';

import { useEffect } from "react";
import { useSession } from "next-auth/react"
import { handleSignOut } from "@/_utils/handleSignOut";
import useSessionCountdown from "@/_hooks/useSessionCountdown";

export default function SessionWatcher() {
  const { data: session } = useSession();

  const timeRemaining = useSessionCountdown(session?.expires);

  useEffect(() => {
    if (timeRemaining === null || !session?.id) return;

    if (timeRemaining === 0) {
      handleSignOut(session.id);
    }
  }, [timeRemaining, session?.id]);

  return null;
}
