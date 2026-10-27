import { useEffect, useState } from "react";

/**
 * Hook that returns the time remaining (in seconds) until session expiry,
 * always subtracting 1 second so logout happens slightly before true expiry.
*/

export default function useSessionCountdown(expiresAt?: string | null) {

  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!expiresAt) return;

    const expiry = new Date(expiresAt).getTime() - 1000;

    const update = () => {
      const now = Date.now();
      setTimeRemaining(Math.max(Math.floor((expiry - now) / 1000), 0));
    };

    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  return timeRemaining;
}
