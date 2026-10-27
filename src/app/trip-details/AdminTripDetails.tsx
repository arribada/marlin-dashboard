import { RoleViewProps } from "@/_types/roles";
import type { AdminTripDetails } from '@/_types/trip';
import TripDetailsClient from '@/_components/admin/TripDetailsClient';
import { cookies } from "next/headers";

/**
 * Minimal server-side page to fetch trip data with cookies.
 * All UI/interaction is handled in TripDetailsClient.
*/
export default async function AdminTripDetails({ searchParams }: RoleViewProps) {
  const params = await searchParams;
  const tripId = params?.trip as string | undefined;
  if (!tripId) return <p>No trip specified.</p>;

  const cookieStore = await cookies();
  let tripData: AdminTripDetails | null = null;
  let errorMessage = "";

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/trip-details?trip=${encodeURIComponent(tripId)}`,
      { cache: "no-store", headers: { Cookie: cookieStore.toString() } }
    );

    if (!res.ok) {
      errorMessage = "Unable to load trip. Please try again later.";
    } else {
      tripData = await res.json();
    }
  } catch (error) {
    console.error("[AdminTripDetails] Error fetching trip history:", error);
    errorMessage = "Unable to load trip. Please try again later.";
  }

  if (errorMessage) return <p>{errorMessage}</p>;
  if (!tripData) return <p>No trip data available.</p>;

  return (
    <>
      <TripDetailsClient trip={tripData} tripId={tripId} error={errorMessage} />
    </>
  );
}
