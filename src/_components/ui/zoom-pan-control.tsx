'use client';

import { TIMELINE_CONFIG } from '@/_lib/constants';
import { Button } from './button';
import { Slider } from './slider';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";

interface ZoomPanControlsProps {
  zoomLevel: number;
  setZoomLevel: (zoom: number) => void;
  panOffset: number;
  setPanOffset: (pan: number) => void;
}

/*
  Zoom logic:
  - ZoomIn doubles the current zoom level, capped at 100.
  - ZoomOut halves the current zoom level, floored at 1, and resets pan.
  - This creates a sequence like: 1 -> 2 -> 4 -> 8 -> 16 -> 32 -> 64 -> 100.
  - Pan buttons only work when zoomLevel > 1.
*/
export default function ZoomPanControls({
  zoomLevel,
  setZoomLevel,
  panOffset,
  setPanOffset,
}: ZoomPanControlsProps) {


  const handleZoomOut = () => {
    setZoomLevel(Math.max(zoomLevel / 2, TIMELINE_CONFIG.MIN_ZOOM_LEVEL));
    setPanOffset(0);
  };

  const handleZoomIn = () => {
    setZoomLevel(Math.min(zoomLevel * 2, TIMELINE_CONFIG.MAX_ZOOM_LEVEL));
  };

  const handlePanLeft = () => {
    setPanOffset(Math.max(0, panOffset - TIMELINE_CONFIG.PAN_STEP_PERCENT));
  };

  const handlePanRight = () => {
    setPanOffset(Math.min(100, panOffset + TIMELINE_CONFIG.PAN_STEP_PERCENT));
  };

  return (
    <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg mb-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomOut}
          disabled={zoomLevel === 1}
          data-testid="zoom-out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2 min-w-[200px]" data-testid="zoom-control">
          <span className="text-xs text-muted-foreground">Zoom:</span>

          <Slider
            value={[Math.log2(zoomLevel)]}
            onValueChange={([value]) => setZoomLevel(Math.pow(2, value))}
            min={Math.log2(TIMELINE_CONFIG.MIN_ZOOM_LEVEL)}
            max={Math.log2(100)}
            step={0.1}
            className="flex-1"
          />
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomIn}
          disabled={zoomLevel >= 100}
          data-testid="zoom-in"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>

      <div className="h-6 w-px bg-border" />

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePanLeft}
          disabled={panOffset === 0 || zoomLevel === 1}
          data-testid="pan-left"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <span className="text-xs text-muted-foreground min-w-[60px] text-center">
          {zoomLevel > 1 ? "Pan" : "Full Trip"}
        </span>

        <Button
          variant="outline"
          size="icon"
          onClick={handlePanRight}
          disabled={panOffset === 100 || zoomLevel === 1}
          data-testid="pan-right"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
