import { Badge } from "@/_components/ui/badge";
import { Play } from "lucide-react";
import { ScrollArea } from "@/_components/ui/scroll-area";
import { Audio } from "@/_types/audio";
import { safeLength } from "@/_utils/helpers";
interface AudioGridProps {
  audios: Audio[] | null;
  selectedAudio: Audio | null;
  onSelectAudio: (audio: Audio) => void;
}
export default function AudioGrid({ audios, selectedAudio, onSelectAudio }: AudioGridProps) {
  const audioCount = safeLength(audios);
  return (
    <div className="w-1/4" data-testid="audio-grid">
      <div className="flex items-center mb-4 text-muted-foreground">
        <h3>Available Audios</h3>
        <Badge className="ml-6">
          {audioCount} audio{audioCount !== 1 ? "s" : ""}
        </Badge>
      </div>
      <ScrollArea className="h-auto">
        <div className="space-y-2 pr-6">
          {audios?.map((audio) => (
            <button
              key={audio.id}
              onClick={() => onSelectAudio(audio)}
              className={`w-full text-left p-3 rounded-lg border transition-all ${
                selectedAudio?.id === audio.id
                  ? "bg-ocean-blue text-white border-ocean-blue shadow-md"
                  : "bg-card border-ocean-blue/10 hover:border-ocean-blue/30 hover:bg-muted/50"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-12 h-9 rounded flex-shrink-0 flex items-center justify-center ${
                    selectedAudio?.id === audio.id
                      ? "bg-white/20"
                      : "bg-muted"
                  }`}
                >
                  <Play
                    className={`h-4 w-4 ${
                      selectedAudio?.id === audio.id ? "text-white" : "text-muted-foreground"
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm mb-1 ${
                    selectedAudio?.id === audio.id ? "text-white" : "text-foreground"
                  }`}>
                    {audio.name}
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
