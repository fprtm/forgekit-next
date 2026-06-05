"use client";
"use no memo";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState,
  TableState,
  VisibilityState,
  OnChangeFn,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";
import { FilterOption } from "./data-table-faceted-filter";

export interface DataTableFilterColumn {
  id: string;
  title: string;
  options: FilterOption[];
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  autoNumbering?: boolean;
  filterColumns?: DataTableFilterColumn[];

  // Server-side overrides
  pageCount?: number;
  rowCount?: number;
  manualPagination?: boolean;
  manualSorting?: boolean;
  manualFiltering?: boolean;
  state?: Partial<TableState>;
  onPaginationChange?: OnChangeFn<PaginationState>;
  onSortingChange?: OnChangeFn<SortingState>;
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder,
  autoNumbering = false,
  filterColumns,
  pageCount,
  rowCount,
  manualPagination = false,
  manualSorting = false,
  manualFiltering = false,
  state,
  onPaginationChange,
  onSortingChange,
  onColumnFiltersChange,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Resolve state values favoring external state if provided
  const resolvedColumnFilters = state?.columnFilters ?? columnFilters;
  const resolvedSorting = state?.sorting ?? sorting;
  const resolvedPagination = state?.pagination ?? pagination;

  const finalColumns = React.useMemo(() => {
    if (!autoNumbering) return columns;

    const indexColumn: ColumnDef<TData, unknown> = {
      id: "index",
      header: () => <div className="w-[30px] text-center">#</div>,
      cell: ({ row, table }) => {
        // Calculate correct index whether client-side or server-side
        const { pageIndex, pageSize } = table.getState().pagination;
        const isServerSide = table.options.manualPagination;
        const absoluteIndex = isServerSide
          ? pageIndex * pageSize + row.index + 1
          : row.index + 1;

        return <div className="text-center font-medium">{absoluteIndex}</div>;
      },
      enableSorting: false,
      enableHiding: false,
    };

    return [indexColumn, ...columns];
  }, [columns, autoNumbering]);

  const table = useReactTable({
    data,
    columns: finalColumns,
    pageCount,
    rowCount,
    manualPagination,
    manualSorting,
    manualFiltering,
    state: {
      sorting: resolvedSorting,
      columnVisibility,
      rowSelection,
      columnFilters: resolvedColumnFilters,
      pagination: resolvedPagination,
      ...state, // Override with any other external state
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: onPaginationChange ?? setPagination,
    onSortingChange: onSortingChange ?? setSorting,
    onColumnFiltersChange: onColumnFiltersChange ?? setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: manualFiltering ? undefined : getFilteredRowModel(),
    getPaginationRowModel: manualPagination
      ? undefined
      : getPaginationRowModel(),
    getSortedRowModel: manualSorting ? undefined : getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className="space-y-4">
      <DataTableToolbar
        table={table}
        searchKey={searchKey}
        searchPlaceholder={searchPlaceholder}
        filterColumns={filterColumns}
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (autoNumbering ? 1 : 0)}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
