import * as React from "react";
import { Table } from "@tanstack/react-table";
import { X, PlusCircle } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { DataTableViewOptions } from "./data-table-view-options";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import type { DataTableFilterColumn } from "./data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  searchKey?: string;
  searchPlaceholder?: string;
  filterColumns?: DataTableFilterColumn[];
}

export function DataTableToolbar<TData>({
  table,
  searchKey,
  searchPlaceholder = "Search...",
  filterColumns,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  const externalSearchValue = searchKey
    ? ((table.getColumn(searchKey)?.getFilterValue() as string) ?? "")
    : "";

  const [searchValue, setSearchValue] = React.useState(externalSearchValue);
  const [prevExternalSearchValue, setPrevExternalSearchValue] =
    React.useState(externalSearchValue);

  if (externalSearchValue !== prevExternalSearchValue) {
    setSearchValue(externalSearchValue);
    setPrevExternalSearchValue(externalSearchValue);
  }

  React.useEffect(() => {
    if (searchKey && searchValue !== prevExternalSearchValue) {
      const timeout = setTimeout(() => {
        table.getColumn(searchKey)?.setFilterValue(searchValue);
        setPrevExternalSearchValue(searchValue);
      }, 300);

      return () => clearTimeout(timeout);
    }
  }, [searchValue, searchKey, prevExternalSearchValue, table]);

  // Track which filters the user has pinned to the toolbar
  const [activeFilterIds, setActiveFilterIds] = React.useState<Set<string>>(
    new Set(),
  );

  // Automatically pin any filter that has a value so it doesn't vanish while interacting
  if (filterColumns) {
    const currentFilters = table.getState().columnFilters;
    let missingIds = false;
    currentFilters.forEach((f) => {
      if (!activeFilterIds.has(f.id)) {
        missingIds = true;
      }
    });

    if (missingIds) {
      const next = new Set(activeFilterIds);
      currentFilters.forEach((f) => next.add(f.id));
      setActiveFilterIds(next);
    }
  }

  const visibleFilterColumns = React.useMemo(() => {
    if (!filterColumns) return [];
    return filterColumns.filter((filter) => {
      const hasValue =
        table.getColumn(filter.id)?.getFilterValue() !== undefined;
      return hasValue || activeFilterIds.has(filter.id);
    });
  }, [filterColumns, activeFilterIds, table]);

  const hiddenFilterColumns = React.useMemo(() => {
    if (!filterColumns) return [];
    return filterColumns.filter((filter) => {
      const hasValue =
        table.getColumn(filter.id)?.getFilterValue() !== undefined;
      return !hasValue && !activeFilterIds.has(filter.id);
    });
  }, [filterColumns, activeFilterIds, table]);

  return (
    <div className="flex flex-col gap-3">
      {/* Top Row: Search, + Filter Button, View Options */}
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          {searchKey && (
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              className="h-8 w-[150px] lg:w-[250px]"
            />
          )}

          {filterColumns && hiddenFilterColumns.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-dashed"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {hiddenFilterColumns.map((filter) => (
                  <DropdownMenuItem
                    key={filter.id}
                    onClick={() => {
                      setActiveFilterIds((prev) => {
                        const next = new Set(prev);
                        next.add(filter.id);
                        return next;
                      });
                    }}
                  >
                    {filter.title}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <DataTableViewOptions table={table} />
      </div>

      {/* Bottom Row: Active Filter Chips */}
      {visibleFilterColumns.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {visibleFilterColumns.map(
            (filter) =>
              table.getColumn(filter.id) && (
                <DataTableFacetedFilter
                  key={filter.id}
                  column={table.getColumn(filter.id)}
                  title={filter.title}
                  options={filter.options}
                />
              ),
          )}

          {isFiltered && (
            <Button
              variant="ghost"
              onClick={() => {
                table.resetColumnFilters();
                setActiveFilterIds(new Set());
              }}
              className="h-8 px-2 lg:px-3 whitespace-nowrap"
            >
              Reset
              <X className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
