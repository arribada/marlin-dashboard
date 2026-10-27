import dynamic from 'next/dynamic';
import { getRoleView } from '@/_lib/getRoleView';

const AdminExport = dynamic(() => import('./AdminExport'));
const FisherExport = dynamic(() => import('./FisherExport'));
const AnalystExport = dynamic(() => import('./AnalystExport'));

const roleViews = {
  admin: AdminExport,
  fisher: FisherExport,
  analyst: AnalystExport,
};

export default async function Page() {
  const ExportView = await getRoleView(roleViews);
  return <ExportView />;
}
