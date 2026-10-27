import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Ship, AlertTriangle, Clock, MapPin, Eye } from "lucide-react";
import { RecentVesselLocation } from "@/_types/vessel";
import { formatLat, formatLon, formatTimeAgo } from "@/_utils/formatting";
import Link from "next/link";
import { AdminAlert } from "@/_types/alert";

interface DashboardCardProps {
  title: string;
  icon: React.ReactNode;
  badge?: React.ReactNode;
  items: { id: React.Key; content: React.ReactNode; href: string }[];
  viewAllHref: string;
  viewAllLabel: string;
  error?: string;
}

function DashboardCard({ title, icon, badge, items, viewAllHref, viewAllLabel, error }: DashboardCardProps) {
  return (
    <Card className="flex flex-col h-full" data-testid={`${title.toLowerCase().replace(/\s+/g, "-")}-card`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-ocean-blue">
          {icon}
          {title}
          {badge && <span className="ml-auto">{badge}</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 space-y-4">
        {error? (
          <div className="flex flex-col items-center gap-1" data-testid="card-error">
            <div className="flex items-center gap-2 text-muted-foreground">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span className="text-sm">Unable to load</span>
            </div>
          </div>
          ) : (items.map(({ id, content, href }) => (
          <div key={id} className="flex items-start justify-between p-3 rounded-lg border bg-muted/50">
            {content}
            <Button className="text-ocean-blue" asChild variant="ghost" size="sm">
              <Link href={href}><Eye className="w-4 h-4" /></Link>
            </Button>
          </div>
          )
        ))}
      </CardContent>
      {!error && (
        <Button variant="outline" className="w-full mt-auto" asChild>
          <Link href={viewAllHref} data-testid={`view-all-${title.toLowerCase().replace(/\s+/g, "-")}`}>{viewAllLabel}</Link>
        </Button>
      )}
    </Card>
  );
}

interface DashboardCardsProps {
  alerts: AdminAlert[] | null;
  bycatch: AdminAlert[] | null;
  vessels: RecentVesselLocation[] | null;
  errors: Record<string, string>;
}

export default function DashboardCards({ vessels, alerts, bycatch, errors }: DashboardCardsProps) {

  const vesselItems = (vessels ?? []).map((vessel) => ({
    id: vessel.name,
    href: `/trip-history?v=${vessel.id}&name=${vessel.name}`,
    content: (
      <div className={`vessel-item-${vessel.id}`}>
        <div className="font-medium mb-2">{vessel.name}</div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {vessel.location.latitude && vessel.location.longitude
              ? `${formatLat(vessel.location.latitude)}, ${formatLon(vessel.location.longitude)}`
              : "-"}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {vessel.location.time ? formatTimeAgo(vessel.location.time) : "-"}
          </span>
        </div>
      </div>
    ),
  }));

  const alertItems = (alerts ?? []).map((alert) => ({
    id: alert.id,
    // TBC where this should link to
    href: "",
    content: (
      <div className={`alert-item-${alert.id}`}>
        <Badge variant="alert" className="text-sm mb-2">{alert.type}</Badge>
        <div className="space-y-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><Ship className="w-3 h-3" />{alert.vesselName}</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {alert.time ? formatTimeAgo(alert.time) : "-"}
          </span>
        </div>
      </div>
    ),
  }));

  const bycatchItems = (bycatch ?? []).map((item) => ({
    id: item.id,
    href: "",
    content: (
      <div className={`bycatch-item-${item.id}`}>
        <Badge variant="destructive" className="text-sm mb-2">{item.type}</Badge>
        <div className="space-y-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><Ship className="w-3 h-3" />{item.vesselName}</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {item.time ? formatTimeAgo(item.time) : "-"}
          </span>
        </div>
      </div>
    ),
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-6">
      <DashboardCard
        title="Recent Vessel Locations"
        icon={<Ship className="w-5 h-5" />}
        items={vesselItems}
        viewAllHref="/vessels"
        viewAllLabel="View All Vessels"
        error={errors.vessels}
      />
      <DashboardCard
        title="Recent Alerts"
        icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
        badge={<Badge variant="alert">{alerts?.length}</Badge>}
        items={alertItems}
        viewAllHref="/map"
        viewAllLabel="View All Alerts"
        error={errors.recentAlerts}
      />
      <DashboardCard
        title="Recent Bycatch"
        icon={<AlertTriangle className="w-5 h-5 text-destructive" />}
        badge={<Badge variant="destructive">{bycatch?.length}</Badge>}
        items={bycatchItems}
        viewAllHref="/map"
        viewAllLabel="View All Bycatch"
        error={errors.recentBycatch}
      />
    </div>
  );
}
