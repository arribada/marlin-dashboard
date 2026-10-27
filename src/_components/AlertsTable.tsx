"use client"

import * as React from "react";
import {
  Clapperboard,
  Eye,
  FileText,
  Fish,
  MapPin,
  Headphones,
  Search,
} from "lucide-react";
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import { Badge } from "@/_components/ui/badge";
import { Card, CardContent, CardHeader } from "@/_components/ui/card";
import { Input } from "@/_components/ui/input";
import {
  capitaliseAndSpace,
  formatTimeThenDate,
  formatLat,
  formatLon
} from "@/_utils/formatting";
import { safeLength } from "@/_utils/helpers";
import { paginationClasses, tableClasses } from "@/_styles/table";
import type { Alert } from "@/_types/alert";
import { AlertBadges } from "./ui/alert-badges";
import { emptyCellClasses } from "@/_styles/text";
import Retry from "./ui/retry";

interface AlertsTableProps {
  alerts: Alert[];
  selectedEvent?: Alert | null;
  onEventSelect?: (event: Alert) => void;
  error: string | null;
  anonymised?: boolean;
}

export default function AlertsTable({ alerts, selectedEvent, onEventSelect, error, anonymised=false }: AlertsTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");

  const columns = React.useMemo<ColumnDef<Alert>[]>(
    () => [
      { id: "alertName",
        accessorKey: "name",
        header: "Alert",
        cell: ({ getValue }) => {
          const value = getValue<string>();
          const variant =
            value?.startsWith("B")
              ? "destructive"
              : value?.startsWith("A")
              ? "alert"
              : "default";

          return (
            <Badge variant={variant}>{value}</Badge>
          );
        },
      },
      { id: "species",
        accessorKey: "speciesDetected",
        header: "Species Detected",
        accessorFn: (row) => row.speciesDetected?.join(", ") || "",
        cell: ({ row }) => {
          const arr = row.original.speciesDetected;
          const formatted = arr && arr.length ? capitaliseAndSpace(arr.join(", ")) : "-";
          return <p>{formatted}</p>;
        }
      },
      { id: "alertStartTime",
        accessorKey: "time",
        header: "Time",
        cell: ({ getValue }) => (
          <div className="font-mono text-xs whitespace-pre-line">
            {formatTimeThenDate(getValue() as string)}
          </div>
        ),
      },
      { accessorKey: "location",
        header: "Location",
        cell: ({ row }) => {
          const longitude = row.original.longitude;
          const latitude = row.original.latitude;
          return (
            <div className="flex items-start gap-1">
              <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
              <span className="truncate font-mono text-xs">
                {formatLat(latitude)},<br/> {formatLon(longitude)}
              </span>
            </div>
          );
        },
      },
      { id: "availableMedia",
        header: "Available Media",
        accessorFn: (row) => {
          const media = [];
          if (row.videoFileIds && row.videoFileIds.length > 0) media.push("video");
          if (row.audioFileIds && row.audioFileIds.length > 0) media.push("audio");
          if (row.transcriptFileIds && row.transcriptFileIds.length > 0) media.push("transcript");
          return media.join(", ");
        },
        cell: ({ row }) => {
          const videos = row.original.videoFileIds;
          const audios = row.original.audioFileIds;
          const stts = row.original.transcriptFileIds;

          return (
            <div className="flex items-center gap-2">
              {safeLength(videos) > 0 && (
                <Badge>
                  <Clapperboard className="h-3 w-3 mr-1" />
                  Video
                </Badge>
              )}
              {safeLength(audios) > 0 && (
                <Badge>
                  <Headphones className="h-3 w-3 mr-1" />
                  Audio
                </Badge>
              )}
              {safeLength(stts) > 0 && (
                <Badge>
                  <FileText className="h-3 w-3 mr-1" />
                  Transcript
                </Badge>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "actions",
        header: "Actions",
        cell: () => (
          <span className="flex items-center text-ocean-blue hover:text-ocean-blue-dark">
            <Eye className="h-4 w-4 mr-2" />
            View Media
          </span>
        ),
      }
    ],
    []
  );

  const columnVisibility = React.useMemo(() => ({
    availableMedia: !anonymised,
    actions: !anonymised,
  }), [anonymised]);

  const table = useReactTable({
    data: alerts,
    columns,
    state: { sorting, globalFilter, columnVisibility },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  });

  const isEmptyDataset = alerts.length === 0;
  const noFilteredMatches = !isEmptyDataset && table.getFilteredRowModel().rows.length === 0;

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="text-ocean-blue flex items-center gap-3 mb-2">
            <Fish className="h-6 w-6" />
            <h2>{ anonymised ? "Alerts Log" : "Trip Alerts Log" }</h2>
          </div>
          <AlertBadges alerts={alerts} />
        </div>
        <div className="text-muted-foreground">
          <p>Alerts and bycatch events detected with species, timings{anonymised ? ' and locations.' : ', locations and media.'}
          { !anonymised && " Click on a row to view associated media."}
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {error ? (
          <Retry message={error} className="w-full" />
        ) : (
          <>
          {/* Filter */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="alerts_search"
              placeholder="Search alerts..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Table */}
          <div className={tableClasses.container}>
            <table className={tableClasses.table}>
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id} className={tableClasses.tr}>
                    {headerGroup.headers.map(header => (
                      <th key={header.id} onClick={header.column.getToggleSortingHandler()} className={tableClasses.th}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: " 🔼",
                          desc: " 🔽"
                        }[header.column.getIsSorted() as string] ?? null}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className={tableClasses.body}>
                {isEmptyDataset ? (
                  <tr>
                    <td colSpan={columns.length} className={emptyCellClasses}>
                      No alert data available for this trip.
                    </td>
                  </tr>
                ) : noFilteredMatches ? (
                  <tr>
                    <td colSpan={columns.length} className={emptyCellClasses}>
                      No events match your search.
                      <br />
                      <button
                        onClick={() => setGlobalFilter("")}
                        className="underline text-blue-600"
                      >
                        Clear filters
                      </button>
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => {
                    const isSelected = selectedEvent?.name === row.original.name;
                    return (
                    <tr
                      key={row.id}
                      onClick={() => onEventSelect?.(row.original)}
                      className={`${tableClasses.tr} cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-ocean-blue/10 hover:bg-ocean-blue/15'
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className={tableClasses.td}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  )}))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {table.getPageCount() > 0 && (
            <div className={paginationClasses.container}>
              <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className={paginationClasses.previous}>Previous</button>
              <span>Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}</span>
              <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className={paginationClasses.next}>Next</button>
            </div>
          )}
        </>
        )}

      </CardContent>
    </Card>
  );
}
