'use client';

import * as React from "react";
import {
  useReactTable,
  ColumnDef,
  SortingState,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender } from "@tanstack/react-table";
import { Card, CardHeader, CardTitle, CardContent } from "@/_components/ui/card";
import { Badge } from "@/_components/ui/badge";
import { Button } from "@/_components/ui/button";
import { Input } from "@/_components/ui/input";
import { Anchor, Search, Download, Eye, AlertCircle } from "lucide-react";
import { tableClasses, paginationClasses } from "@/_styles/table";
import { formatDateThenTime, formatDuration } from "@/_utils/formatting";
import Link from "next/link";
import type { AdminTripSummary } from '@/_types/trip';
import { emptyCellClasses } from "@/_styles/text";

export default function TripHistoryTable({
  trips,
  errorMessage
}: {
  trips: AdminTripSummary[],
  errorMessage: string | null
}) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");

  const columns = React.useMemo<ColumnDef<AdminTripSummary>[]>(
    () => [
      { accessorKey: "name",
        header: "Trip",
        cell: ({ row, getValue }) => (
          <Link
            href={`/trip-details?trip=${row.original.id}`}
            data-testid="trip-link-name"
            className="text-ocean-blue hover:text-ocean-blue-dark"
          >
            {getValue() as string}
          </Link>
        )
      },
      { accessorKey: "start",
        header: "Start",
        cell: ({ getValue }) => (
          <div
            className="font-mono text-xs whitespace-pre-line"
            data-testid="trip-start"
          >
            {formatDateThenTime(getValue() as string)}
          </div>
        )
      },
      { accessorKey: "end",
        header: "End",
        cell: ({ getValue }) => (
          <div
            className="font-mono text-xs whitespace-pre-line"
            data-testid="trip-end"
          >
            {formatDateThenTime(getValue() as string)}
          </div>
        )
      },
      { id: "duration",
        header: "Duration",
        cell: ({ row }) => (
          <div data-testid="trip-duration">
            {formatDuration(
              row.original.start,
              row.original.end
            )}
          </div>
        )
      },
      { accessorKey: "alerts",
        header: "Alerts",
        cell: ({ row }) => {
          const bycatchEvents = row.original.bycatchEventCount;
          const alerts = row.original.alertCount - bycatchEvents;

          const badges = [];

          if (bycatchEvents > 0) {
            badges.push(
              <Badge key="bycatch" variant="destructive" data-testid="bycatch-badge">
                <AlertCircle className="h-3 w-3 mr-1" data-testid="bycatch-icon"/>
                {bycatchEvents} event{bycatchEvents !== 1 ? "s" : ""}
              </Badge>
            );
          }

          if (alerts > 0) {
            badges.push(
              <Badge key="alert" variant="alert" data-testid="alert-badge">
                {alerts} alert{alerts !== 1 ? "s" : ""}
              </Badge>
            );
          }

          // If neither bycatch nor alerts, show default badge
          if (badges.length === 0) {
            badges.push(
              <Badge key="none" className="border-transparent" data-testid="no-alerts-badge">
                No alerts
              </Badge>
            );
          }

          return (
            <div className="flex items-center gap-2" data-testid="trip-bycatch-count">
              {badges}
            </div>
          );
        }
      },
      { accessorKey: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            className="px-0"
          >
            <Link
              href={`/trip-details?trip=${row.original.id}`}
              data-testid="trip-link-action"
              className="flex items-center text-ocean-blue hover:text-ocean-blue-dark"
              aria-label={`View trip details for ${row.getValue("name")}`}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Trip Details
            </Link>
          </Button>
        ),
      }
    ],
    []
  );

  const table = useReactTable({
    data: trips,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 12 } },
  });

  const isEmptyDataset = trips.length === 0;
  const noFilteredMatches = !isEmptyDataset && table.getFilteredRowModel().rows.length === 0;

  return (
    <Card className="my-6">
      <CardHeader className="flex justify-between items-center">
        <CardTitle className="flex items-center gap-2 text-ocean-blue">
          <Anchor data-testid="trip-history-icon" className="w-5 h-5 text-ocean-blue" />
          Trip History{" "}
          <Badge>
            {table.getFilteredRowModel().rows.length} trips
          </Badge>
        </CardTitle>
        {/* TODO: Implement 'Export CSV' functionality */}
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="trip_search"
            placeholder="Search trips..."
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
              {errorMessage ? (
                <tr>
                  <td colSpan={columns.length} className={emptyCellClasses}>
                    {errorMessage}
                  </td>
                </tr>
              ) : isEmptyDataset ? (
                <tr>
                  <td colSpan={columns.length} className={emptyCellClasses}>
                    No trips recorded yet.
                  </td>
                </tr>
              ) : noFilteredMatches ? (
                <tr>
                  <td colSpan={columns.length} className={emptyCellClasses}>
                    No trips match your search.
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
                    {row.getVisibleCells().map(cell => (
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
            <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className={paginationClasses.previous}>Previous</button>
            <span>Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}</span>
            <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className={paginationClasses.next}>Next</button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
