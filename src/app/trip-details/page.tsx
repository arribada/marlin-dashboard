import dynamic from 'next/dynamic';
import { getRoleView } from "@/_lib/getRoleView";

const AdminTripDetails = dynamic(() => import('./AdminTripDetails'));
const FisherTripDetails = dynamic(() => import('./FisherTripDetails'));

// Analyst intentionally omitted — analysts have no access to trip details
const roleViews = {
  admin: AdminTripDetails,
  fisher: FisherTripDetails,
};

export default async function Page(props: any) {
  const TripView = await getRoleView(roleViews);
  return <TripView searchParams={props.searchParams} />;
}
