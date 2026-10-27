import { ShieldAlert } from 'lucide-react';
import { Card, CardContent } from '@/_components/ui/card';
import Link from 'next/link';

export default function UnauthorisedPage() {
  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-12 pb-10 px-6 text-center">

          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-ocean-blue/10 mb-6">
            <ShieldAlert className="h-8 w-8 text-ocean-blue" />
          </div>

          <div className="flex flex-col gap-3 mb-6">
            <p className="text-ocean-blue">Unauthorised</p>

            <p className="text-muted-foreground leading-relaxed">
              You don't have permission to access this page.
            </p>

            <Link href="/dashboard" className="text-ocean-blue underline">
              Return to Dashboard
            </Link>
          </div>

          <div className="pt-6 border-t">
            <p className="text-sm text-muted-foreground">
              If you believe this is an error, please contact your system administrator
            </p>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
