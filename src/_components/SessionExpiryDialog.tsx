'use client';

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/_components/ui/dialog"
import { Button } from "@/_components/ui/button"
import { handleSignOut } from "@/_utils/handleSignOut";
import useSessionCountdown from "@/_hooks/useSessionCountdown";

export default function SessionExpiryDialog() {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();

  const countdown = useSessionCountdown(session?.expires);

  useEffect(() => {
    if (countdown === null) return;

    // If countdown reaches 0, close modal and sign out user
    if (countdown === 0) {
      setOpen(false);
      handleSignOut(session?.id);
      return;
    }

    // If time remaining is less than 2 mins, open modal
    if (countdown <= 120 && !open) {
      setOpen(true);
    }

    // If the user switches back to the tab while the modal is open,
    // NextAuth considers this 'activity' and refreshes the session expiry.
    // The remaining time is now greater than 2 minutes, close the modal to reflect the updated expiry.
    if (countdown > 120 && open) {
      setOpen(false);
    }
  }, [countdown, open, session?.id]);

  if (countdown === null) return null;

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogTitle>Session Expiring Soon</DialogTitle>
        <DialogDescription>
          Your session will end in{" "}
          <span aria-live="polite">
            {minutes}:{seconds.toString().padStart(2, "0")}
          </span>
          . <br/>Would you like to stay signed in?
        </DialogDescription>

        <div className="mt-6 flex justify-between gap-3">
          <Button
            variant="outline"
            onClick={() => {
              handleSignOut(session?.id);
              setOpen(false);
            }}
          >
            Sign out now
          </Button>

          <Button onClick={() => window.location.reload()} >
            Continue session
          </Button>

        </div>
      </DialogContent>
    </Dialog>
  )
}
