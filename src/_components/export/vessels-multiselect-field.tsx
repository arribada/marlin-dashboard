import { Ship, ChevronDown, Search } from "lucide-react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "../ui/command";
import { Badge } from "../ui/badge";
import { VesselMinimal } from "@/_types/vessel";
import { useState } from "react";

type VesselsMultiselectFieldProps = {
  vessels: VesselMinimal[];
  selectedVessels: number[];
  onToggle: (id: number) => void;
}

export function VesselsMultiselectField({ vessels, selectedVessels, onToggle }: VesselsMultiselectFieldProps) {
  const [vesselSearchOpen, setVesselSearchOpen] = useState(false);

  return(
    <div className="space-y-3 pb-6 border-b">
      <span className="flex items-center gap-2 font-medium">
        <Ship className="h-4 w-4 text-ocean-blue" />
        Select Vessels
      </span>

      <Popover open={vesselSearchOpen} onOpenChange={setVesselSearchOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={vesselSearchOpen}
            data-testid="vessel-combobox"
            className="w-full justify-between bg-input-background h-auto min-h-[2.5rem] py-2"
          >
            <div className="flex flex-wrap gap-2">
              {selectedVessels.length === 0 ? (
                <span className="text-muted-foreground">Select vessels...</span>
              ) : (
                selectedVessels.map(vesselId => {
                  const vessel = vessels.find(v => v.id === vesselId);
                  return vessel ? (
                    <Badge key={vesselId} className="text-sm">{vessel.name}</Badge>
                  ) : null;
                })
              )}
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <CommandInput placeholder="Search vessels..." className="h-9" />
            </div>
            <CommandList>
              <CommandEmpty>No vessel found.</CommandEmpty>
              <CommandGroup>
                {vessels.map((vessel) => (
                  <CommandItem
                    key={vessel.id}
                    value={vessel.name}
                    onSelect={() => onToggle(vessel.id)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`h-4 w-4 border rounded flex items-center justify-center ${
                        selectedVessels.includes(vessel.id)
                          ? "bg-ocean-blue border-ocean-blue"
                          : "border-muted-foreground"
                      }`}>
                        {selectedVessels.includes(vessel.id) && (
                          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <p>{vessel.name}</p>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <p className="text-sm text-muted-foreground" data-testid="vessel-count">
        {selectedVessels.length} vessel{selectedVessels.length !== 1 ? "s" : ""} selected
      </p>
    </div>
  )
};
