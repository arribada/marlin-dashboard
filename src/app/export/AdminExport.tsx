import { Form } from "@/_components/export/form";
import { Button } from "@/_components/ui/button";
import { Card, CardHeader } from "@/_components/ui/card";
import { requireAdminSession } from "@/_lib/auth-helpers";
import { ArrowLeft } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";

export default async function AdminExport() {
  await requireAdminSession();

  const cookieStore = await cookies();
  let vessels = [];
  let errorMessage = "";

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/vessels?fields=minimal`,
      { cache: "no-store", headers: { Cookie: cookieStore.toString() } }
    );

    if (!res.ok) {
      errorMessage = "Unable to load vessel data. Please try again later.";
    } else {
      vessels = await res.json();
    }
  } catch (error) {
    console.error("[AdminExport] Error fetching vessel data:", error);
    errorMessage = "Unable to load vessel data. Please try again later.";
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-6">
          <div className="flex items-start gap-4">
            <Button variant="ghost" size="icon" className="shrink-0">
              <Link href="/dashboard" >
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>

            <div>
              <h1 className="mb-2 text-ocean-blue">Data Exports</h1>
              <p className="text-sm text-muted-foreground">
                Configure export parameters and download system data
              </p>
            </div>

          </div>
        </CardHeader>
      </Card>

      <Form vessels={vessels} role="admin" />
    </>
  );
}
