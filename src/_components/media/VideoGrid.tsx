import { Badge } from "@/_components/ui/badge";
import { Play } from "lucide-react";
import { ScrollArea } from "@/_components/ui/scroll-area";
import { Video } from "@/_types/video";
import { safeLength } from "@/_utils/helpers";
interface VideoGridProps {
  videos: Video[] | null;
  selectedVideo: Video | null;
  onSelectVideo: (video: Video) => void;
}
export default function VideoGrid({ videos, selectedVideo, onSelectVideo }: VideoGridProps) {
  const videoCount = safeLength(videos);
  return (
    <div className="w-1/4 self-stretch flex flex-col" data-testid="video-grid">
      <div className="flex items-center mb-4 text-muted-foreground">
        <h3>Available Videos</h3>
        <Badge className="ml-6">
          {videoCount} video{videoCount !== 1 ? "s" : ""}
        </Badge>
      </div>
      <ScrollArea className="h-60 lg:h-150">
        <div className="space-y-2 pr-6">
          {videos?.map((video) => (
            <button
              key={video.id}
              onClick={() => onSelectVideo(video)}
              className={`w-full text-left p-3 rounded-lg border transition-all ${
                selectedVideo?.id === video.id
                  ? "bg-ocean-blue text-white border-ocean-blue shadow-md"
                  : "bg-card border-ocean-blue/10 hover:border-ocean-blue/30 hover:bg-muted/50"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-12 h-9 rounded flex-shrink-0 flex items-center justify-center ${
                    selectedVideo?.id === video.id
                      ? "bg-white/20"
                      : "bg-muted"
                  }`}
                >
                  <Play
                    className={`h-4 w-4 ${
                      selectedVideo?.id === video.id ? "text-white" : "text-muted-foreground"
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm mb-1 ${
                    selectedVideo?.id === video.id ? "text-white" : "text-foreground"
                  }`}>
                    {video.name}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
