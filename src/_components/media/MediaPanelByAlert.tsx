import { Card, CardHeader } from "../ui/card";
import AudioPlayer from "./AudioPlayer";
import AudioGrid from "./AudioGrid";
import TranscriptView from "./TranscriptViewer";
import VideoGrid from "@/_components/media/VideoGrid";
import VideoPlayer from "@/_components/media/VideoPlayer";
import { Badge } from "../ui/badge";
import { loadingTextClasses } from "@/_styles/text";
import { Clapperboard, FileText, Headphones } from "lucide-react";
import { Alert } from "@/_types/alert";
import { useMediaFiles } from "@/_hooks/useMediaFiles";
import { Video } from "@/_types/video";
import { Audio } from "@/_types/audio";
import { Transcript } from "@/_types/transcript";

interface MediaPanelByAlertProps {
  event: Alert;
  role: 'fisher' | 'admin';
  vesselId?: string;
}

export default function MediaPanelByAlert({ event, role, vesselId }: MediaPanelByAlertProps ) {
  const baseEndpoint = role === 'admin' ? '/api/admin' : '/api/fisher';
  const extraParams = role === 'admin' && vesselId ? { v: vesselId } : undefined;

  const {
    files: videoFiles,
    selected: selectedVideo,
    setSelected: setSelectedVideo,
    loading: videosLoading,
    error: videosError
  } = useMediaFiles<Video>(event.videoFileIds, "video", `${baseEndpoint}/videos`, extraParams);

  const {
    files: audioFiles,
    selected: selectedAudio,
    setSelected: setSelectedAudio,
    loading: audiosLoading,
    error: audiosError
  } = useMediaFiles<Audio>(event.audioFileIds, "audio", `${baseEndpoint}/audios`, extraParams);

  const {
    files: transcriptFiles,
    loading: transcriptsLoading,
    error: transcriptsError
  } = useMediaFiles<Transcript>(event.transcriptFileIds, "transcript", `${baseEndpoint}/transcripts`, extraParams);


  const fileBadges = [
    { icon: Clapperboard, label: "video", count: videoFiles.length },
    { icon: Headphones, label: "audio", count: audioFiles.length },
    { icon: FileText, label: "transcript", count: transcriptFiles.length },
  ];

  return (
    <Card className="mt-6 gap-3" data-testid="media-panel">
      <CardHeader className="border-b flex justify-between">
        <div className="items-start justify-between gap-4">
          <div className="flex items-center gap-3 mb-2" data-testid="media-panel-title">
            <h2 className="text-ocean-blue font-normal">Media for Event: {event.name}</h2>
          </div>
          <span className="text-sm text-muted-foreground">Video, audio, and written transcript for this specific event.</span>
        </div>

        {/* Media count badges */}
        <div className="flex gap-2">
          {fileBadges.map(({ icon: Icon, label, count }) => (
            <Badge key={label}>
              <Icon className="h-3 w-3 mr-1" />
              {count} {label}{count !== 1 ? "s" : ""}
            </Badge>
          ))}
        </div>
      </CardHeader>

      {videosLoading ? (
        <div className={loadingTextClasses}><p>Loading videos...</p></div>
      ) : videosError ? (
        <div className={loadingTextClasses}><p>{videosError}</p></div>
      ) : (
        <div className="flex flex-row w-full py-6 border-b">
          <VideoPlayer
            selectedEvent={event}
            selectedVideo={selectedVideo}
            vesselId={vesselId ?? undefined} // Fisher context: vesselId not available
          />
          {videoFiles.length > 0 && (
            <VideoGrid
              selectedVideo={selectedVideo}
              onSelectVideo={setSelectedVideo}
              videos={videoFiles}
            />
          )}
        </div>
      )}

      {audiosLoading ? (
        <div className={loadingTextClasses}><p>Loading audios...</p></div>
      ) : audiosError ? (
        <div className={loadingTextClasses}><p>{audiosError}</p></div>
      ) : (
        <div className="flex flex-row w-full py-6 border-b">
          <AudioPlayer
            selectedEvent={event}
            selectedAudio={selectedAudio}
            vesselId={vesselId ?? undefined} // Fisher context: vesselId not available
          />
          {audioFiles.length > 0 && (
            <AudioGrid
              selectedAudio={selectedAudio}
              onSelectAudio={setSelectedAudio}
              audios={audioFiles}
            />
          )}
        </div>
      )}

      {transcriptsLoading ? (
        <div className={loadingTextClasses}><p>Loading transcripts...</p></div>
      ) : transcriptsError ? (
        <div className={loadingTextClasses}><p>{transcriptsError}</p></div>
      ) : <TranscriptView transcripts={transcriptFiles} />}

    </Card>
  )
};
