'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/_components/ui/card";
import { Button } from "@/_components/ui/button";
import { Input } from "@/_components/ui/input";
import { Badge } from "@/_components/ui/badge";
import { Ship, Download, MapPin, Search, AlertCircle, Eye, Clock } from "lucide-react";
import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";
import type { AdminVessel } from "@/_types/vessel";
import { paginationClasses, tableClasses } from "@/_styles/table"
import Link from 'next/link';
import { formatLat, formatLon, formatTimeAgo } from '@/_utils/formatting';
import { emptyCellClasses } from "@/_styles/text";

export default function VesselTable({
    vessels,
    errorMessage
  }: {
    vessels: AdminVessel[],
    errorMessage: string | null
  }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");

  const columns = React.useMemo<ColumnDef<AdminVessel>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Vessel Name",
        cell: ({ row, getValue }) => (
          <Link
            href={`/trip-history?v=${row.original.id}&name=${encodeURIComponent(row.original.name)}`}
            className="text-ocean-blue hover:text-ocean-blue-dark"
          >
            {getValue() as string}
          </Link>
        )
      },{
        accessorKey: "registration",
        header: "Registration",
      },{
        accessorKey: "status",
        header: "System Status",
        cell: ({ getValue }) => {
          const status = getValue();
          return status === 'fault'
            ? <Badge variant="destructive">Fault</Badge>
            : <Badge variant="success">Operational</Badge>
        }
      },{
        accessorKey: "lastPosition",
        header: "Last Known Location",
        cell: ({ row }) => {
          const lon = row.original.lastPosition.longitude;
          const lat = row.original.lastPosition.latitude;

          return (
            <div className="flex items-start gap-1">
              <MapPin className="h-3 w-3 mt-0.5 shrink-0 text-ocean-blue" />
              <span>
                {lon && lat ? (
                  <>
                    {formatLat(lat)}, {formatLon(lon)}
                  </>
                ) : "-"}
              </span>
            </div>
          )
        },
      },
      {
        accessorKey: "lastPosition.time",
        header: "Last Updated",
        cell: ({ row }) => {
          const time = row.original.lastPosition.time;

          if (time === null) {return <span className="text-muted-foreground">-</span>}

          return (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3 shrink-0" />
              <span>{time ? formatTimeAgo(time) : "-"}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "lastRecording",
        header: "Last Recording",
        cell: ({ row }) => {
          const type = row.original.lastRecording.type;

          if (type === null) {return <Badge>No recordings</Badge>};

          return (
            <Badge variant={type === "bycatch" ? "destructive" : "alert"}>
              <AlertCircle className="h-3 w-3 mr-1" />
              {type === "bycatch" ? "Bycatch" : "Alert"}
            </Badge>
          );
        },
      },
      {
        accessorKey: "lastRecording.time",
        header: "Recording Time",
        cell: ({ row }) => {
          const time = row.original.lastRecording.time;

          if (time === null) {return <span className="text-muted-foreground">-</span>}

          return (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3 shrink-0" />
              <span>{time ? formatTimeAgo(time) : "-"}</span>
            </div>
          );
        },
      },{
        accessorKey: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Link
            href={`/trip-history?v=${row.original.id}&name=${encodeURIComponent(row.original.name)}`}
            className="text-ocean-blue hover:text-ocean-blue-dark"
          >
            <span className="flex items-center text-ocean-blue hover:text-ocean-blue-dark">
              <Eye className="h-4 w-4 mr-2" />
              View Trip History
            </span>
          </Link>
        ),
      }
    ],
    []
  );

  const table = useReactTable({
    data: vessels,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 12 } },
  });

  const isEmptyDataset = vessels.length === 0;
  const noFilteredMatches = !isEmptyDataset && table.getFilteredRowModel().rows.length === 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Ship className="w-5 h-5 text-ocean-blue" />
            Vessels
            <Badge>{table.getFilteredRowModel().rows.length} vessels</Badge>
          </CardTitle>

          <div className="flex items-center gap-2">
            {/* TODO: Implement 'Export CSV' functionality */}
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="vessel_search"
            placeholder="Search vessels..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Table */}
        <div className={tableClasses.container}>
          <table className={tableClasses.table}>
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className={tableClasses.tr}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className={tableClasses.th}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {{
                        asc: " 🔼",
                        desc: " 🔽",
                      }[header.column.getIsSorted() as string] ?? null}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody className={tableClasses.body}>
              {errorMessage ? (
                <tr>
                  <td colSpan={columns.length} className={emptyCellClasses}>
                    {errorMessage}
                  </td>
                </tr>
              ) : isEmptyDataset ? (
                <tr>
                  <td colSpan={columns.length} className={emptyCellClasses}>
                    No vessels recorded yet.
                  </td>
                </tr>
              ) : noFilteredMatches ? (
                <tr>
                  <td colSpan={columns.length} className={emptyCellClasses}>
                    No vessels match your search.
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
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className={tableClasses.tr}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className={tableClasses.td}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                )))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {table.getPageCount() > 0 && (
          <div className={paginationClasses.container}>
            <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className={paginationClasses.previous}>
              Previous
            </button>
            <span>
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className={paginationClasses.next}>
              Next
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
