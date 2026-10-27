import { Button } from "../ui/button";
import { Clapperboard, AlertCircle, Loader2, VideoOff } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { CardContent } from "../ui/card";
import { Video } from "@/_types/video";
import { Alert } from "@/_types/alert";
import { MediaEmpty } from "../ui/media-empty";

type VideoPlayerProps = {
  selectedEvent?: Alert | null;
  selectedVideo: Video | null;
  vesselId?: string;
};

export default function VideoPlayer({ selectedEvent, selectedVideo, vesselId }: VideoPlayerProps) {
  const currentVideoId = selectedVideo?.id ?? selectedEvent?.videoFileIds?.[0];

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(!!currentVideoId);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setError(null);
    setIsLoading(!!currentVideoId);
  }, [currentVideoId]);

  function getVideoSrc(videoId: string | undefined, vesselId?: string) {
    if (!videoId) return undefined;
    return vesselId
      ? `/api/admin/videos/${videoId}/stream?v=${vesselId}`
      : `/api/fisher/videos/${videoId}/stream`;
  }

  const handleError = () => {
    setError("Failed to load video. Please try again.");
    setIsLoading(false);
  };

  const handleLoadedData = () => {
    setIsLoading(false);
    setError(null);
  };

  return (
    <CardContent className="space-y-4 w-full" data-testid="video-player">
      <div className="flex items-center">
        <div className="flex items-center gap-2 text-ocean-blue">
          <Clapperboard className="h-5 w-5" />
          <h3>Video Footage:</h3>
        </div>
        {selectedVideo &&
          <p className="text-sm text-muted-foreground ml-4">{selectedVideo.name}</p>
        }
      </div>

      {selectedVideo ? (
        <div className="relative group bg-black rounded-lg aspect-video overflow-hidden">
          <video
            ref={videoRef}
            // Admins pass vesselId explicitly via query param;
            // Fishers have it in their token so the API resolves it server-side
            src={getVideoSrc(currentVideoId, vesselId)}
            className="w-full h-full object-cover"
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onError={handleError}
            onLoadedData={handleLoadedData}
            onWaiting={() => setIsLoading(true)}
            onCanPlay={() => setIsLoading(false)}
            controls
          />

          {/* Overlay controls */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            <div className="flex-1 flex items-center justify-center pointer-events-none">
              {error ? (
                <div className="pointer-events-auto text-center">
                  <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                  </div>
                  <p className="text-center text-sm text-white mb-2">{error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setError(null);
                      setIsLoading(true);
                      if (videoRef.current) {
                        videoRef.current.load();
                      }
                    }}
                    className="bg-white/10 text-white hover:bg-white/20"
                  >
                    Retry
                  </Button>
                </div>
              ) : isLoading ? (
                <div className="pointer-events-none text-center">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                  <p className="text-center text-sm text-white/75">Loading video...</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        <MediaEmpty icon={VideoOff} mediaType="video data" />
      )}
    </CardContent>
  );
}
