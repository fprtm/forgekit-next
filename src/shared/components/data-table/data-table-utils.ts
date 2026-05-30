import { ColumnFiltersState, PaginationState, SortingState } from "@tanstack/react-table"

export interface TableQueryParams {
  page?: number
  limit?: number
  sort?: string
  filter?: Record<string, string>
}

/**
 * Builds an API query payload from TanStack Table state.
 * This can be used to seamlessly pass data to your backend fetcher or update URL search params.
 */
export function buildTableQuery(
  pagination: PaginationState,
  sorting: SortingState,
  columnFilters: ColumnFiltersState
): TableQueryParams {
  const query: TableQueryParams = {
    page: pagination.pageIndex + 1, // API usually uses 1-indexed pages
    limit: pagination.pageSize,
  }

  if (sorting.length > 0) {
    const sortParams = sorting.map((s) => `${s.id}:${s.desc ? "desc" : "asc"}`)
    query.sort = sortParams.join(",")
  }

  if (columnFilters.length > 0) {
    query.filter = {}
    columnFilters.forEach((filter) => {
      if (Array.isArray(filter.value)) {
        query.filter![filter.id] = filter.value.join(",")
      } else {
        query.filter![filter.id] = String(filter.value)
      }
    })
  }

  return query
}

/**
 * Parses URL Search Params back into TanStack Table initial state.
 * Useful for restoring table state on page reload in server-side mode.
 */
export function parseTableState(searchParams: URLSearchParams) {
  const state: {
    pagination: PaginationState
    sorting: SortingState
    columnFilters: ColumnFiltersState
  } = {
    pagination: {
      pageIndex: 0,
      pageSize: 10,
    },
    sorting: [],
    columnFilters: [],
  }

  const page = searchParams.get("page")
  const limit = searchParams.get("limit")
  if (page) state.pagination.pageIndex = Math.max(0, parseInt(page) - 1)
  if (limit) state.pagination.pageSize = parseInt(limit)

  const sort = searchParams.get("sort")
  if (sort) {
    state.sorting = sort.split(",").map((s) => {
      const [id, desc] = s.split(":")
      return { id, desc: desc === "desc" }
    })
  }

  // Parse filters (assuming format filter[key]=value)
  searchParams.forEach((value, key) => {
    if (key.startsWith("filter[") && key.endsWith("]")) {
      const columnId = key.substring(7, key.length - 1)
      state.columnFilters.push({
        id: columnId,
        value: value.includes(",") ? value.split(",") : value,
      })
    }
  })

  return state
}

/**
 * Converts a TableQueryParams object into a URLSearchParams string for navigation.
 */
export function stringifyTableQuery(query: TableQueryParams): string {
  const params = new URLSearchParams()
  
  if (query.page) params.set("page", String(query.page))
  if (query.limit) params.set("limit", String(query.limit))
  if (query.sort) params.set("sort", query.sort)
  
  if (query.filter) {
    Object.entries(query.filter).forEach(([key, value]) => {
      params.set(`filter[${key}]`, value)
    })
  }
  
  return params.toString()
}
