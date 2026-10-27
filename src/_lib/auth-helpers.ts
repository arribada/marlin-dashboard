import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "./authOptions";

export async function requireAdminSession() {
  const session = await getServerSession(authOptions);

  if (!session) { redirect('/login') }

  if (session.user?.role !== 'admin') { redirect('/unauthorised')}

  return session;
}

export async function requireFisherSession() {
  const session = await getServerSession(authOptions);

  if (!session) { redirect('/login') }

  if (session.user?.role !== 'fisher') { redirect('/unauthorised') }

  return session;
}
