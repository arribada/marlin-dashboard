import { RoleViewProps } from "@/_types/roles";
import { parseTripDataSource, type TripDetails } from '@/_types/trip';
import TripDetailsClient from '@/_components/fisher/TripDetailsClient';
import { cookies } from "next/headers";

/**
 * Minimal server-side page to fetch trip data with cookies.
 * All UI/interaction is handled in TripDetailsClient.
*/
export default async function FisherTripDetails({ searchParams }: RoleViewProps) {
  const params = await searchParams;
  const tripName = params?.trip as string | undefined;
  if (!tripName) return <p>No trip specified.</p>;
  const source = parseTripDataSource(params?.source);

  const cookieStore = await cookies();
  let tripData: TripDetails | null = null;
  let errorMessage = "";

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/fisher/trip-details?trip=${encodeURIComponent(tripName)}&source=${source}`,
      { cache: "no-store", headers: { Cookie: cookieStore.toString() } }
    );

    if (!res.ok) {
      errorMessage = "Unable to load trip. Please try again later.";
    } else {
      tripData = await res.json();
    }
  } catch (error) {
    console.error("[FisherTripDetails] Error fetching trip history:", error);
    errorMessage = "Unable to load trip. Please try again later.";
  }

  if (errorMessage) return <p>{errorMessage}</p>;
  if (!tripData) return <p>No trip data available.</p>;

  return (
    <>
      <TripDetailsClient key={source} trip={tripData} error={errorMessage} source={source} />
    </>
  );
}
