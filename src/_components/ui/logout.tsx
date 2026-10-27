'use client'

import { handleSignOut } from "@/_utils/handleSignOut";
import { useSession } from "next-auth/react";

export default function Logout(){
  const { data: session } = useSession();

  if (!session?.id) {
    throw new Error("No session ID available for logout. User must be signed in.");
  }

  return (
    <span
      onClick={() => { handleSignOut(session.id) }}
      className="cursor-pointer"
    >
      Logout
    </span>
  )
}
