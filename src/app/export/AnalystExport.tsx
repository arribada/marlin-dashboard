import { Form } from "@/_components/export/form";
import { Button } from "@/_components/ui/button";
import { Card, CardHeader } from "@/_components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function AnalystExport() {
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

      <Form vessels={null} role="analyst" />
    </>
  );
}
