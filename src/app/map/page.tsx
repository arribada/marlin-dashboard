import dynamic from 'next/dynamic';
import { getRoleView } from "@/_lib/getRoleView";

const AdminMap = dynamic(() => import('./AdminMap'));
const FisherMap = dynamic(() => import('./FisherMap'));
const AnalystMap = dynamic(() => import('./AnalystMap'));

const roleViews = {
  admin: AdminMap,
  fisher: FisherMap,
  analyst: AnalystMap,
};

export default async function Page(props: any) {
  const TripView = await getRoleView(roleViews);
  return <TripView searchParams={props.searchParams} />;
}
