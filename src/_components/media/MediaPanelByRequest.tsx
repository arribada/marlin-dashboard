import { Card, CardContent, CardHeader } from "../ui/card";
import AudioPlayer from "./AudioPlayer";
import AudioGrid from "./AudioGrid";
import TranscriptView from "./TranscriptViewer";
import VideoGrid from "@/_components/media/VideoGrid";
import VideoPlayer from "@/_components/media/VideoPlayer";
import { Badge } from "../ui/badge";
import { loadingTextClasses } from "@/_styles/text";
import { Clapperboard, FileText, Headphones } from "lucide-react";
import { Video } from "@/_types/video";
import { Audio } from "@/_types/audio";
import { Transcript } from "@/_types/transcript";
import { useEffect, useState } from "react";
import { formatDateThenTime } from "@/_utils/formatting";

interface RangeMediaPanelProps {
  start: Date;
  end: Date;
  types: ('video' | 'audio' | 'transcript')[];
  role: 'admin' | 'fisher';
  vesselId?: string;
}

export default function MediaPanelByRequest({ start, end, types, role, vesselId }: RangeMediaPanelProps) {
  const baseEndpoint = role === 'admin' ? '/api/admin' : '/api/fisher';

  const [videoFiles, setVideoFiles] = useState<Video[]>([]);
  const [audioFiles, setAudioFiles] = useState<Audio[]>([]);
  const [transcriptFiles, setTranscriptFiles] = useState<Transcript[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [selectedAudio, setSelectedAudio] = useState<Audio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const startISO = start.toISOString();
  const endISO = end.toISOString();
  const typesKey = types.join(',');

  useEffect(() => {
    async function fetchRangeMedia() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set('start', startISO);
        params.set('end', endISO);
        // "type" is appended multiple times (one per type)
        typesKey.split(',').filter(Boolean).forEach(t => params.append('type', t));
        if (role === 'admin' && vesselId) params.set('v', vesselId);

        // api/admin/media-by-range?start=xx&end=yy&type=video&type=audio&v=xx
        // api/fisher/media-by-range?start=xx&end=yy&type=video&type=audio
        const response = await fetch(`${baseEndpoint}/media-by-range?${params}`);
        if (!response.ok) throw new Error('Failed to fetch media files');

        const files = await response.json();

        const videos = files.filter((f: any) => f.type === 'video');
        const audios = files.filter((f: any) => f.type === 'audio');
        const transcripts = files.filter((f: any) => f.type === 'transcript');

        setVideoFiles(videos);
        setAudioFiles(audios);
        setTranscriptFiles(transcripts);

        if (videos.length > 0) setSelectedVideo(videos[0]);
        if (audios.length > 0) setSelectedAudio(audios[0]);

      } catch (err) {
        console.error('[RangeMediaPanel] fetch error:', err);
        setError('Unable to load media for this time range');
      } finally {
        setLoading(false);
      }
    }

    fetchRangeMedia();
  }, [startISO, endISO, typesKey]); // role, vesselId, baseEndpoint are stable and never change

  const fileBadges = [
    { icon: Clapperboard, label: "video", count: videoFiles.length },
    { icon: Headphones, label: "audio", count: audioFiles.length },
    { icon: FileText, label: "transcript", count: transcriptFiles.length },
  ];

  const formattedRange = `${formatDateThenTime(start)} - ${formatDateThenTime(end)}`;

  if (loading) return (
    <Card className="my-6">
      <CardContent className="p-6">
        <p className={loadingTextClasses}>Loading media for selected range...</p>
      </CardContent>
    </Card>
  );

  if (error) return (
    <Card className="my-6">
      <CardContent className="p-6">
        <p className="text-muted-foreground text-sm">{error}</p>
      </CardContent>
    </Card>
  );

  return (
    <Card className="my-6 gap-3">
      <CardHeader className="border-b flex justify-between">
        <div className="items-start justify-between gap-4">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-ocean-blue font-normal">
              Media for Range: {formattedRange}
            </h2>
          </div>
          <span className="text-sm text-muted-foreground">
            Video, audio, and transcript for the requested time window.
          </span>
        </div>
        <div className="flex gap-2">
          {fileBadges.map(({ icon: Icon, label, count }) => (
            <Badge key={label}>
              <Icon className="h-3 w-3 mr-1" />
              {count} {label}{count !== 1 ? "s" : ""}
            </Badge>
          ))}
        </div>
      </CardHeader>

      {types.includes('video') && (
        <div className="flex flex-row w-full py-6 border-b">
          <VideoPlayer
            selectedVideo={selectedVideo}
            vesselId={vesselId}
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

      {types.includes('audio') && (
        <div className="flex flex-row w-full py-6 border-b">
          <AudioPlayer
            selectedAudio={selectedAudio}
            vesselId={vesselId}
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

      {types.includes('transcript') && (
        <TranscriptView transcripts={transcriptFiles} />
      )}
    </Card>
  );
}
