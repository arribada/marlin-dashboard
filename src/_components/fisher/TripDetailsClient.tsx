'use client';

import { useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import AlertsTable from "@/_components/AlertsTable";
import TripDetailsBanner from "@/_components/fisher/TripDetailsBanner";
import { Timeline } from "@/_components/Timeline";
import { Tabs, TabsList, TabsTrigger } from "@/_components/ui/tabs";
import { parseTripDataSource, TripDataSource, TripDetails } from "@/_types/trip";
import { Alert } from "@/_types/alert";
import { MediaRequestForm } from "../media/MediaRequestForm";
import MediaPanelByAlert from "../media/MediaPanelByAlert";
import MediaPanelByRequest from "../media/MediaPanelByRequest";

const VesselTrackMap = dynamic(
  () => import("../map-vessels/VesselTrackMap").then((mod) => mod.VesselTrackMap),
  { ssr: false, loading: () => <div className="h-full w-full rounded-lg bg-muted animate-pulse" /> }
);

interface TripDetailsClientProps {
  trip: TripDetails;
  error: string;
  source: TripDataSource;
}

type MediaSource =
  | { kind: 'alertClick'; event: Alert }
  | { kind: 'mediaRequest'; start: Date; end: Date; types: ('video' | 'audio' | 'transcript')[] }
  | null;

export default function TripDetailsClient({ trip, error, source }: TripDetailsClientProps ) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isSwitchingSource, startSourceTransition] = useTransition();
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [clickedTime, setClickedTime] = useState<Date>(new Date(trip.start));
  const [mediaSource, setMediaSource] = useState<MediaSource>(null);

  const handleSourceChange = (value: string) => {
    const next = parseTripDataSource(value);
    if (next === source) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("source", next);
    startSourceTransition(() => router.replace(`${pathname}?${params.toString()}`));
  };

  const handleEventSelect = (event: Alert) => {
    if (!event) return;
    setMediaSource({ kind: 'alertClick', event });
    setShowRequestForm(false);
  };

  const handleTimelineClick = (timestamp: Date) => {
    setClickedTime(timestamp);
    setShowRequestForm(true);
  };

  const handleFormSubmit = (start: Date, end: Date, types: ('video' | 'audio' | 'transcript')[]) => {
    setMediaSource({ kind: 'mediaRequest', start, end, types });
  };

  return (
    <>
      <Tabs className="mb-4" value={source} onValueChange={handleSourceChange} data-testid="trip-data-source-toggle">
        <TabsList className="self-end">
          <TabsTrigger value="cls" disabled={isSwitchingSource}>CLS data</TabsTrigger>
          <TabsTrigger value="mobile" disabled={isSwitchingSource}>Mobile data</TabsTrigger>
        </TabsList>
      </Tabs>

      <TripDetailsBanner
        start={trip.start}
        end={trip.end}
        name={trip.name}
      />

      <Timeline
        identifier={{ role: 'fisher', name: trip.name }}
        trip={trip}
        error={error}
        onTimelineClick={handleTimelineClick}
      />

      {showRequestForm &&
        <MediaRequestForm
          key={clickedTime.getTime()}
          initialStart={clickedTime}
          onSubmit={handleFormSubmit}
          onClose={() => setShowRequestForm(false)}
          trip={trip}
        />
      }

      {mediaSource?.kind === 'mediaRequest' && (
        <MediaPanelByRequest
          role="fisher"
          start={mediaSource.start}
          end={mediaSource.end}
          types={mediaSource.types}
        />
      )}

      <AlertsTable
        alerts={trip.recordings}
        selectedEvent={mediaSource?.kind === 'alertClick' ? mediaSource.event : null}
        onEventSelect={handleEventSelect}
        error={error}
      />

      {mediaSource?.kind === 'alertClick' && (
        <MediaPanelByAlert event={mediaSource.event} role="fisher" />
      )}

      <VesselTrackMap points={trip.gps} alerts={trip.recordings} />
    </>
  );
}
