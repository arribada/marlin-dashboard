import dynamic from 'next/dynamic';
import { getRoleView } from '@/_lib/getRoleView';

const AdminDashboard = dynamic(() => import('./AdminDashboard'));
const FisherDashboard = dynamic(() => import('./FisherDashboard'));
const AnalystDashboard = dynamic(() => import('./AnalystDashboard'));

const roleViews = {
  admin: AdminDashboard,
  fisher: FisherDashboard,
  analyst: AnalystDashboard,
};

export default async function Page() {
  const DashboardView = await getRoleView(roleViews);
  return <DashboardView />;
}
