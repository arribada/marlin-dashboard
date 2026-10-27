'use client';

import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, Popup, TileLayer, GeoJSON } from 'react-leaflet';
import { Alert, AdminAlert, isAdminAlert } from '@/_types/alert';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { CircleSmall, Clapperboard, FileText, Headphones } from 'lucide-react';
import Retry from '../ui/retry';
import { capitaliseAndSpace, formatTimestampIntoDate, formatTimestampIntoTime } from '@/_utils/formatting';
import { mapTooltipClasses } from '@/_styles/tooltip';
import { Badge } from '../ui/badge';
import { getVesselNameForDemoPurposesOnly } from "@/_lib/vesselsForDemoPurposesOnly";
import { useEffect, useMemo, useState } from 'react';

const createIcon = (speciesDetected: number, id: string) => {
  const colorClass = speciesDetected && speciesDetected > 0 ? 'fill-destructive/50 stroke-destructive' : 'fill-amber-500/50 stroke-amber-500';

  const iconMarkup = renderToStaticMarkup(
    <div data-testid={`marker-${id}`}>
      <CircleSmall size={32} className={colorClass} />
    </div>
  );

  return L.divIcon({
    className: 'custom-div-icon',
    html: iconMarkup,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

interface MapProps {
  alerts: Alert[] | AdminAlert[];
  alertErrorMessage: string;
  showIcesAreas: boolean;
}

export default function AlertMap({ alerts, alertErrorMessage, showIcesAreas }: MapProps) {
  const [icesData, setIcesData] = useState(null);
  const [icesError, setIcesError] = useState(false);
  const [icesLoading, setIcesLoading] = useState(true);

  const visibleAlerts = useMemo(
    () => alerts.filter(alert => !(alert.latitude === 0 && alert.longitude === 0)),
    [alerts]
  );

  useEffect(() => {
    fetch('/api/map/ices')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => {
        if (!data.features?.length) throw new Error('No features returned');
        setIcesData(data);
      })
      .catch(err => {
        console.warn('ICES layer unavailable:', err.message);
        setIcesError(true);
      })
      .finally(() => setIcesLoading(false));
  }, []);

  const fileTypes = [
    { key: 'hasVideo', label: 'Video', Icon: Clapperboard },
    { key: 'hasAudio', label: 'Audio', Icon: Headphones },
    { key: 'hasTranscript', label: 'Transcript', Icon: FileText },
  ] as const;

  // Not using validateEnvVar() here, Next.js only inlines NEXT_PUBLIC_* vars for a
  // static `process.env.NEXT_PUBLIC_X` reference, not a dynamic helper lookup.
  const CARTO_API_KEY = process.env.NEXT_PUBLIC_CARTO_API_KEY;
  if (!CARTO_API_KEY) {

    throw new Error('[ENV] Missing required environment variable: NEXT_PUBLIC_CARTO_API_KEY');
  }

  return alertErrorMessage ? (
    <Retry message={alertErrorMessage} className="h-full w-full rounded-lg bg-muted"/>
  ) : (
    <MapContainer
      // Default view centred on UK coastline
      // TODO: dynamic centring based on vessel positions
      center={[52.5, -3.5]}
      zoom={5}
      className="h-full w-full rounded-lg z-0"
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url={`https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${CARTO_API_KEY}`}
        maxZoom={20}
      />

      {showIcesAreas && icesLoading && (
        <div className="map-badge">Loading ICES areas...</div>
      )}

      {showIcesAreas && icesError && (
        <div className="map-badge map-badge--warn">
          ICES areas unavailable
        </div>
      )}

      {showIcesAreas && icesData &&
        <GeoJSON
          data={icesData}
          style={{ color: '#040e96', weight: 1, fillOpacity: 0.05, fillColor: '#1527ac' }}
          onEachFeature={(feature, layer) => {
            const name = feature.properties.Area_27 || 'Unknown';
            layer.bindTooltip(name, { sticky: true, className: 'ices-tooltip' });
          }}
      />}

      {visibleAlerts.map(alert => {
        const isBycatch = alert.speciesDetected;
        return (
          <Marker
            key={alert.id}
            position={[alert.latitude, alert.longitude]}
            icon={createIcon(alert.speciesDetected?.length, alert.id)}
          >
            <Popup data-testid={`${isBycatch ? "bycatch" : "alert"}-tooltip`}>
              <div className={`w-64 text-base ${mapTooltipClasses}`}>
                <div className="flex items-center justify-between">
                  <span className="font-medium mb-0">{alert.name}</span>
                  <Badge variant={ isBycatch ? "destructive" : "alert" }>
                    {isBycatch ? "Bycatch Detected" : "Alert"}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span>{formatTimestampIntoDate(alert.time)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time:</span>
                    <span>{formatTimestampIntoTime(alert.time)}</span>
                  </div>

                  {isAdminAlert(alert) && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Vessel:</span>
                      {/* Hack for Demo Purposes Only */}
                      <span>{getVesselNameForDemoPurposesOnly(alert.vesselId)}</span>
                    </div>
                  )}

                  {isBycatch && Array.isArray(alert.speciesDetected) && alert.speciesDetected.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground whitespace-nowrap">Species Detected:</span>
                      <span className="text-right">
                        {alert.speciesDetected.map((species, i) => (
                          <span key={i}>
                            {capitaliseAndSpace(species)}
                            {i < alert.speciesDetected.length - 1 && <>,<br /></>}
                          </span>
                        ))}
                      </span>
                    </div>
                  )}

                  {isAdminAlert(alert) && (
                    <div className="text-left">
                      <span className="text-muted-foreground">Available Media:</span>
                      {!fileTypes.some(({ key }) => alert[key]) ? (
                        <span>-</span>
                      ) : (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {fileTypes.map(({ key, label, Icon }) =>
                            alert[key] ? (
                              <Badge key={key}>
                                <Icon className="h-3 w-3 mr-1" />
                                {label}
                              </Badge>
                            ) : null
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
          );
        })}
    </MapContainer>
  );
}
