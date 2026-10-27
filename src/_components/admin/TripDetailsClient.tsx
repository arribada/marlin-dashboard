'use client';

import { useState } from "react";
import AlertsTable from "@/_components/AlertsTable";
import TripDetailsBanner from "@/_components/admin/TripDetailsBanner";
import { Timeline } from "@/_components/Timeline";
import { AdminTripDetails } from "@/_types/trip";
import { Alert } from "@/_types/alert";
import { MediaRequestForm } from "../media/MediaRequestForm";
import MediaPanelByAlert from "../media/MediaPanelByAlert";
import MediaPanelByRequest from "../media/MediaPanelByRequest";
import dynamic from "next/dynamic";

const VesselTrackMap = dynamic(
  () => import("../map-vessels/VesselTrackMap").then((mod) => mod.VesselTrackMap),
  { ssr: false, loading: () => <div className="h-full w-full rounded-lg bg-muted animate-pulse" /> }
);

interface TripDetailsClientProps {
  trip: AdminTripDetails;
  tripId: string;
  error: string;
}

type MediaSource =
  | { kind: 'alertClick'; event: Alert }
  | { kind: 'mediaRequest'; start: Date; end: Date; types: ('video' | 'audio' | 'transcript')[] }
  | null;

export default function TripDetailsClient({ trip, tripId, error }: TripDetailsClientProps ) {
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [clickedTime, setClickedTime] = useState<Date>(new Date(trip.start));
  const [mediaSource, setMediaSource] = useState<MediaSource>(null);

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
      <TripDetailsBanner
        vesselName={trip.vesselName}
        vesselId={trip.vesselId}
        start={trip.start}
        end={trip.end}
        name={trip.name}
      />

      <Timeline
        identifier={{ role: 'admin', id: tripId }}
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
          role="admin"
          start={mediaSource.start}
          end={mediaSource.end}
          types={mediaSource.types}
          vesselId={trip.vesselId}
        />
      )}

      <AlertsTable
        alerts={trip.recordings}
        selectedEvent={mediaSource?.kind === 'alertClick' ? mediaSource.event : null}
        onEventSelect={handleEventSelect}
        error={error}
      />

      {mediaSource?.kind === 'alertClick' && (
        <MediaPanelByAlert event={mediaSource.event} role="admin" vesselId={trip.vesselId}/>
      )}

      <VesselTrackMap  points={trip.gps} alerts={trip.recordings}/>
    </>
  );
}
