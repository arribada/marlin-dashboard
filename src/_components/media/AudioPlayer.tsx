'use client';

import { AlertCircle, Loader2, Headphones, HeadphoneOff } from 'lucide-react';
import { useEffect, useRef, useState } from "react";
import { CardContent } from '@/_components/ui/card';
import { Alert } from '@/_types/alert';
import { Audio } from '@/_types/audio';
import { Button } from '../ui/button';
import { MediaEmpty } from '../ui/media-empty';

interface AudioPlayerProps {
  selectedEvent?: Alert | null;
  selectedAudio: Audio | null;
  vesselId?: string;
}

export default function AudioPlayer({ selectedEvent, selectedAudio, vesselId }: AudioPlayerProps) {
  const currentAudioId = selectedAudio?.id || selectedEvent?.audioFileIds?.[0];

  const audioRef = useRef<HTMLAudioElement>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (audioRef.current && currentAudioId) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsAudioPlaying(false);
      audioRef.current.load();
      setError(null);
      setIsLoading(true);
    }
  }, [currentAudioId]);

  function getAudioSrc(audioId: string, vesselId?: string) {
    if (!audioId) return undefined;
    return vesselId
      ? `/api/admin/audios/${audioId}/stream?v=${vesselId}`
      : `/api/fisher/audios/${audioId}/stream`;
  }

  const handleError = () => {
    setError("Failed to load audio. Please try again.");
    setIsLoading(false);
    setIsAudioPlaying(false);
  };

  const handleLoadedData = () => {
    setIsLoading(false);
    setError(null);
  };

  return (
    <CardContent className="w-full" data-testid="audio-player">
      <div className="flex items-center">
        <div className="flex items-center gap-2 text-ocean-blue">
          <Headphones className="h-5 w-5" />
          <h3>Audio Recording:</h3>
        </div>
        { selectedAudio &&
          <p className="text-sm text-muted-foreground ml-4">{selectedAudio.name}</p>
        }
      </div>

      <div className="pt-4 w-full">
        { currentAudioId ? (
          <div className="relative w-full">
            <audio
              ref={audioRef}
              // Admins pass vesselId explicitly via query param;
              // Fishers have it in their token so the API resolves it server-side
              src={getAudioSrc(currentAudioId, vesselId)}
              onPlay={() => setIsAudioPlaying(true)}
              onPause={() => setIsAudioPlaying(false)}
              onEnded={() => setIsAudioPlaying(false)}
              onError={handleError}
              onLoadedData={handleLoadedData}
              onWaiting={() => setIsLoading(true)}
              onCanPlay={() => setIsLoading(false)}
              controls
              preload="metadata"
              className="w-full"
            />

            {/* Overlay controls */}
            { error ? (
              <div className="absolute inset-0 bg-red-500/10 rounded-lg flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <p className="text-sm text-red-500">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setError(null);
                    setIsLoading(true);
                    if (audioRef.current) {
                      audioRef.current.load();
                    }
                  }}
                  className="ml-2"
                >
                  Retry
                </Button>
              </div>
            ) : isLoading ? (
              <div className="absolute inset-0 bg-muted rounded-full flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading audio...</p>
              </div>
            ) : null}
          </div>
        ) : (
          <MediaEmpty icon={HeadphoneOff} mediaType="audio data" />
        ) }
      </div>
    </CardContent>
  );
}
