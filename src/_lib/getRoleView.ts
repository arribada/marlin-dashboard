import { ComponentType } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/_lib/authOptions";
import { RoleViewProps } from "@/_types/roles";

/**
 * Generic role-based view loader
 * @param roleViews A mapping of role name to React component
 * @returns The correct view component for the user's role, or redirects if not authorized
 */
export async function getRoleView(roleViews: Record<string, ComponentType<RoleViewProps>>) {
  const session = await getServerSession(authOptions);

  if (!session) { redirect("/login") }

  const role = session?.user?.role;
  const View = role ? roleViews[role] : null;

  if (!View) { redirect("/dashboard") }

  return View;
}
