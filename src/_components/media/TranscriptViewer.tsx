'use client';

import { ChevronDown, ChevronUp, FileText, FileX } from 'lucide-react';
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useState } from "react";
import { ScrollArea } from '@/_components/ui/scroll-area';
import { CardContent } from '@/_components/ui/card';
import { Transcript } from '@/_types/transcript';
import { formatTimestampIntoDate, formatTimestampIntoTime, stripTimestampMarkers } from '@/_utils/formatting';
import { safeLength } from '@/_utils/helpers';
import { MediaEmpty } from '../ui/media-empty';

type TranscriptProps = {
  transcripts: Transcript[] | null;
};

export default function TranscriptView({ transcripts }: TranscriptProps) {
  const transcriptCount = safeLength(transcripts);
  const [transcriptExpanded, setTranscriptExpanded] = useState(true);

  const groupedTranscripts = transcripts?.reduce((groups, line) => {
    const dateKey = formatTimestampIntoDate(line.start);
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(line);
    return groups;
  }, {} as Record<string, typeof transcripts>);

  return (
    <CardContent data-testid="transcript" className="mb-6">
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center">
          <div className="flex items-center gap-2 text-ocean-blue">
            <FileText className="h-5 w-5" />
            <h3>Transcript</h3>
          </div>
          {transcriptCount > 0 &&
            <Badge className="ml-6">
              {transcriptCount} transcript{transcriptCount !== 1 ? "s" : ""}
            </Badge>
          }
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTranscriptExpanded(!transcriptExpanded)}
          className="text-ocean-blue hover:bg-ocean-blue/5"
        >
          {transcriptExpanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-2" />
              Collapse
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-2" />
              Expand
            </>
          )}
        </Button>
      </div>

      {transcripts && transcripts.length > 0 ? (
        transcriptExpanded && (
          <div className="bg-muted/30 rounded-lg border border-ocean-blue/10">
            <ScrollArea className="h-[320px]">
              <div className="space-y-4">
                {(groupedTranscripts && Object.keys(groupedTranscripts).length > 0) &&
                  Object.entries(groupedTranscripts).map(([date, lines]) => (
                  <div key={date} className="space-y-3">
                    <div className="sticky top-0 bg-muted/30 rounded-t-md bg-ocean-blue/10 py-2 px-3 border-b border-ocean-blue/20">
                      <h4 className="text-sm font-semibold text-ocean-blue">{date}</h4>
                    </div>
                    {lines.map((line, index) => (
                      <div
                        key={line.id}
                        className={`p-3 rounded-lg ${index % 2 === 0 ? "bg-background" : "bg-card"}`}
                        data-testid="transcript-line"
                      >
                        <div className="flex items-center gap-3">
                          <Badge data-testid="timestamp-badge">
                            {formatTimestampIntoTime(line.start)}
                          </Badge>
                          <p className="text-sm text-foreground">
                            {stripTimestampMarkers(line.transcriptContent)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )
      ) : (
        <MediaEmpty icon={FileX} mediaType="transcripts" />
      )}
    </CardContent>
  );
}
