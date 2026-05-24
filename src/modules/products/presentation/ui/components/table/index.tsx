"use client"

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnDef,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ProductEntity } from "../../../../domain/types"
import { AuthUser } from "@/modules/auth/domain/types"
import { useProductTable } from "./use-product-table"
import { PermissionGate } from "@/modules/auth/presentation/ui/components/permission-gate"
import "@/modules/products/domain/policies";

export function ProductTable({
  data,
  currentUser,
}: {
  data: ProductEntity[]
  currentUser: AuthUser | null | undefined
}) {
  const { isDeleting, handleDelete } = useProductTable()

  const columns: ColumnDef<ProductEntity>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("price"))
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount)
        return <div className="font-medium">{formatted}</div>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const product = row.original
        return (
          <div className="flex items-center gap-2">
            <PermissionGate
              action="products:update"
              user={currentUser}
              resource={{id: product.id}}
            >
              <Button variant="outline" size="sm" asChild>
                <Link href={`/products/${product.id}/edit`} data-testid={`edit-button-${product.id}`}>Edit</Link>
              </Button>
            </PermissionGate>
            <PermissionGate
              action="products:delete"
              user={currentUser}
              resource={{id: product.id}}
            >
              <Button
                variant="destructive"
                size="sm"
                disabled={isDeleting}
                onClick={() => handleDelete(product.id)}
                data-testid={`delete-button-${product.id}`}
              >
                Delete
              </Button>
            </PermissionGate>
          </div>
        )
      },
    },
  ]

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                )
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
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
