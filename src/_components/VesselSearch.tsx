"use client";

import { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/_components/ui/input";
import { VesselMinimal } from "@/_types/vessel";
import { fuzzyMatch } from "@/_utils/helpers";
import Link from "next/link";

export default function VesselSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const [vessels, setVessels] = useState<VesselMinimal[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  async function handleFocus() {
    if (hasFetched) return; // only fetch once
    setLoading(true);
    const res = await fetch("/api/admin/vessels?fields=minimal");
    const data = await res.json();
    setVessels(data);
    setHasFetched(true);
    setLoading(false);
  }

  const filtered = query.trim().length === 0 ? []
    : vessels.filter((v) => fuzzyMatch(query, v.name) || fuzzyMatch(query, v.registration));

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || filtered.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      document.querySelector<HTMLAnchorElement>(
        `[data-testid="vessel-search-item"]:nth-child(${activeIndex + 1})`
      )?.click();
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative hidden md:block">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <label htmlFor="vessel_nav_search" className="sr-only">Search vessels</label>
      <Input
        id="vessel_nav_search"
        type="text"
        placeholder="Search vessels..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          handleFocus();
          if (query.trim().length > 0) setOpen(true);
        }}
        className="w-64 pl-9 border-ocean-blue/20 focus:border-ocean-blue"
        aria-label="Search vessels"
        aria-autocomplete="list"
        aria-expanded={open && filtered.length > 0}
        data-testid="vessel-search-input"
      />

      {loading && (
        <div className="absolute top-full mt-1 w-full z-50 rounded-lg border border-ocean-blue/20 bg-background shadow-md px-3 py-4">
          <p className="text-sm text-muted-foreground text-center">Loading...</p>
        </div>
      )}

      {open && filtered.length > 0 && (
        <div className="absolute top-full mt-1 w-full z-50 rounded-lg border border-ocean-blue/20 bg-background shadow-md overflow-hidden"
          data-testid="vessel-search-dropdown">
          {filtered.map((vessel, i) => (
            <Link
              key={vessel.id}
              href={`/trip-history?v=${vessel.id}&name=${encodeURIComponent(vessel.name)}`}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setActiveIndex(i)}
              onClick={() => {
                setQuery("");
                setOpen(false);
                setActiveIndex(-1);
              }}
              className={`block w-full text-left px-3 py-2 transition-colors ${
                i === activeIndex ? "bg-muted" : "hover:bg-muted"
              }`}
              data-testid="vessel-search-item"
            >
              <p className="text-sm font-medium">{vessel.name}</p>
              <p className="text-xs text-muted-foreground">{vessel.registration}</p>
            </Link>
          ))}
        </div>
      )}

      {open && query.trim().length > 0 && filtered.length === 0 && (
        <div className="absolute top-full mt-1 w-full z-50 rounded-lg border border-ocean-blue/20 bg-background shadow-md px-3 py-4">
          <p className="text-sm text-muted-foreground text-center">No vessels found</p>
        </div>
      )}
    </div>
  );
}
