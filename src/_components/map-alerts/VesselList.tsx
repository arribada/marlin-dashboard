'use client';

import { Search } from "lucide-react";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { VesselMinimal } from "@/_types/vessel";
import { Checkbox } from "../ui/checkbox";
import { useState } from "react";
import { Button } from "../ui/button";
import Retry from "../ui/retry";
import { toKebabCase } from "@/_utils/formatting";

interface VesselListProps {
  vessels: VesselMinimal[];
  vesselErrorMessage: string;
  selectedVessels: number[];
  onVesselsChange: (vessels: number[]) => void;
}

export default function VesselList({
  vessels,
  vesselErrorMessage,
  selectedVessels,
  onVesselsChange
}: VesselListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleVesselToggle = (vesselId: number) => {
    onVesselsChange(selectedVessels.includes(vesselId)
      ? selectedVessels.filter((id) => id !== vesselId)
      : [...selectedVessels, vesselId]
    );
  };

  const handleSelectAll = () => onVesselsChange(vessels.map((v) => v.id));
  const handleDeselectAll = () => onVesselsChange([]);

  const filteredVessels = vessels.filter((vessel) =>
    vessel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vessel.registration.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-1/4" data-testid="vessel-list">
      <h3 className="mr-4 mb-4 text-ocean-blue">Vessels</h3>

      {vesselErrorMessage ? (
        <Retry message={vesselErrorMessage} />
      ) : (
        <>
          {/* Search Input */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              name="vessel-list-search"
              placeholder="Search vessels..."
              data-testid="vessel-list-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Select All / Deselect All */}
          <div className="flex gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="flex-1 text-xs"
            >
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeselectAll}
              className="flex-1 text-xs"
            >
              Deselect All
            </Button>
          </div>

          {/* Vessel List */}
          <ScrollArea className="flex-1 h-[500px]">
            <div className="space-y-3 flex flex-col">
              {filteredVessels.map((vessel) => (
                <span
                  key={vessel.name}
                  data-testid={`vessel-item-${toKebabCase(vessel.name)}`}
                  className="w-full text-left px-3 py-2 rounded-lg transition-colors hover:bg-muted border border-ocean-blue/20"
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id={vessel.name}
                      checked={selectedVessels.includes(vessel.id)}
                      onCheckedChange={() => handleVesselToggle(vessel.id)}
                      onClick={(e) => e.stopPropagation()}
                      data-testid={`checkbox-${toKebabCase(vessel.name)}`}
                    />
                    <div className="">
                      <span className="mb-1">{vessel.name}</span>
                      <p className="text-muted-foreground text-sm">
                        {vessel.registration}
                      </p>
                    </div>
                  </div>
                </span>
              ))}

              {filteredVessels.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No vessels found
                </p>
              )}
            </div>
          </ScrollArea>
        </>
      )}
    </div>
  );
}
