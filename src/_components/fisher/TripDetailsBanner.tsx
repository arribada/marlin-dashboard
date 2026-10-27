import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Ship, Timer } from "lucide-react";
import { Button } from "@/_components/ui/button";
import { Card, CardHeader } from "@/_components/ui/card";
import { formatDateShortMonth, formatDuration, formatTime } from "@/_utils/formatting";

interface TripDetailsBannerProps {
  start: string;
  end: string;
  name: string;
}

export default function TripDetailsBanner({ start, end, name }: TripDetailsBannerProps) {
  return (
      <Card data-testid="trip-details-banner">
        <CardHeader className="pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                data-testid="back-button"
              >
                <Link href="/dashboard" data-testid="return-trip-history-link">
                  <ArrowLeft className="h-5 w-5" data-testid="back-arrow-icon"/>
                </Link>
              </Button>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Ship className="h-6 w-6 text-ocean-blue" data-testid="vessel-icon" />
                  <h1 className="text-ocean-blue" data-testid="trip-name">
                    {name}
                  </h1>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1" data-testid="trip-date-section">
                    <Calendar className="h-4 w-4" data-testid="date-icon"/>
                    <span data-testid="trip-date">{formatDateShortMonth(start)}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1" data-testid="trip-start-section">
                    <Clock className="h-4 w-4" data-testid="start-icon"/>
                    <span data-testid="trip-start-time">{formatTime(start)}</span>
                  </div>
                  <span>→</span>
                  <div className="flex items-center gap-1" data-testid="trip-end-section">
                    <span data-testid="trip-end-time">{formatTime(end)}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1" data-testid="trip-duration-section">
                    <Timer className="h-4 w-4" data-testid="duration-icon"/>
                    <span data-testid="trip-duration">{formatDuration(start, end)}</span>
                  </div>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              className="text-ocean-blue border-ocean-blue/20 hover:bg-ocean-blue/5"
              data-testid="view-trip-history-button"
            >
              <Link href="/dashboard" data-testid="view-trip-history-link">
                View Trip History
              </Link>
            </Button>
          </div>
        </CardHeader>
      </Card>
  )
}
