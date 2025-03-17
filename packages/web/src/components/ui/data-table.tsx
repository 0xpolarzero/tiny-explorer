"use client";

import type React from "react";
import { Fragment, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { AlertCircle, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

import { Badge } from "./badge";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isPaginated?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  expandContent?: (row: TData) => React.ReactNode;
  onExpand?: (index: number) => void;
  noDataLabel?: string;
  error?: boolean;
  errorLabel?: string;
  loading?: boolean;
  loadingLabel?: string;
  className?: string;
}

export function DataTable<TData, TValue>({
  columns: userColumns,
  data,
  isPaginated = false,
  pageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
  expandContent,
  onExpand,
  noDataLabel = "No results.",
  error = false,
  errorLabel = "Error loading data.",
  loading = false,
  loadingLabel = "Loading...",
  className,
}: DataTableProps<TData, TValue>) {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  // Create a column for the expand button if expandContent is provided
  const columns = [...userColumns];

  if (expandContent) {
    columns.push({
      id: "expand",
      header: "",
      cell: ({ row }) => {
        const isExpanded = expandedRows[row.id] || false;

        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onExpand?.(row.index);
              setExpandedRows((prev) => ({
                ...prev,
                [row.id]: !prev[row.id],
              }));
            }}
            className="ml-auto h-8 w-8 cursor-pointer p-0"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            <span className="sr-only">Toggle row</span>
          </Button>
        );
      },
      enableSorting: false,
      enableHiding: false,
    } as ColumnDef<TData, any>);
  }

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const isExpanded = expandedRows[row.id] || false;

                return (
                  <Fragment key={row.id}>
                    <TableRow
                      data-state={row.getIsSelected() && "selected"}
                      className={isExpanded ? "bg-muted/20 hover:bg-muted/20 border-b-0" : "hover:bg-muted/20"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      ))}
                    </TableRow>
                    {isExpanded && expandContent && (
                      <TableRow key={`${row.id}-expanded`} className="bg-muted/20 hover:bg-muted/20">
                        <TableCell colSpan={columns.length} className="p-2 pb-4">
                          {expandContent(row.original)}
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex justify-center">
                    <Badge variant={loading ? "outline" : "secondary"} className="flex items-center gap-2">
                      {loading && <Loader2 className="h-3 w-3 animate-spin" />}
                      {error && <AlertCircle className="h-3 w-3" />}
                      {loading ? loadingLabel : error ? errorLabel : noDataLabel}
                    </Badge>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {isPaginated && table.getRowModel().rows?.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground text-sm">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length,
            )}{" "}
            of {table.getFilteredRowModel().rows.length} entries
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Rows per page</p>
              <Select
                value={table.getState().pagination.pageSize.toString()}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={table.getState().pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {pageSizeOptions.map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="h-8 w-8 p-0"
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm font-medium">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="h-8 w-8 p-0"
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
