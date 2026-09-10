"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/shared/components/ui/button"
import Link from "next/link"
import { ProductEntity } from "../../../../domain/entities/product.entity"
import { AuthUser } from "@/modules/auth/domain/types"
import { useProductTable } from "../../hooks/use-product-table"
import { PermissionGate } from "@/modules/auth/presentation/ui/components/permission-gate"
import { DataTable } from "@/shared/components/data-table/data-table"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/shared/components/ui/alert-dialog"
import "@/modules/products/domain/policies";

export function ProductTable({
  data,
  currentUser,
}: {
  data: ProductEntity[]
  currentUser: AuthUser | null | undefined
}) {
  const { isDeleting, pendingDeleteId, openConfirm, cancelDelete, confirmDelete } = useProductTable()

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
                <Link href={`/d/products/${product.id}/edit`} data-testid={`edit-button-${product.id}`}>Edit</Link>
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
                onClick={() => openConfirm(product.id)}
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

  return (
    <>
      <DataTable columns={columns} data={data} searchKey="name" />
      <AlertDialog open={!!pendingDeleteId} onOpenChange={(open) => { if (!open) cancelDelete() }}>
        <AlertDialogContent data-testid="delete-confirm-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this product. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="cancel-delete-button" onClick={cancelDelete}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              data-testid="confirm-delete-button"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
