import AlertsTable from "@/_components/AlertsTable";
import { Alert } from "@/_types/alert";
import { FILTER_START_DATE } from "@/_lib/constants";
import { cookies } from "next/headers";

export default async function AnalystDashboard() {
  const cookieStore = await cookies();
  let alerts: Alert[] = [];
  let errorMessage: string | null = null;

  const start = FILTER_START_DATE;
  const end = new Date();

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/analyst/alerts?start=${start.toISOString()}&end=${end.toISOString()}`,
      { cache: "no-store", headers: { Cookie: cookieStore.toString() } }
    );

    if (!res.ok) {
      errorMessage = "Unable to load alerts. Please try again later.";
    } else {
      alerts = await res.json();
    }
  } catch (error) {
    console.error("[AnalystDashboard] Error fetching trip history:", error);
    errorMessage = "Unable to load trip history. Please try again later.";
  }

  return (
    <>
      <AlertsTable alerts={alerts} error={errorMessage} anonymised={true}/>
    </>
  );
}
