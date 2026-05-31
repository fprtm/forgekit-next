"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import Link from "next/link"
import { formatRole } from "@/shared/lib/utils"
import { UserEntity } from "../../../../domain/entities/user.entity"
import { AuthUser } from "@/modules/auth/domain/types"
import { useUserTable } from "../../hooks/use-user-table"
import { PermissionGate } from "@/modules/auth/presentation/ui/components/permission-gate"
import { DataTable } from "@/shared/components/data-table/data-table"
import { impersonateUserAction } from "@/modules/auth/presentation/http/actions/impersonate.actions"

export function UserTable({
  data,
  currentUser,
}: {
  data: UserEntity[]
  currentUser: AuthUser | null | undefined
}) {
  const { isDeleting, handleDelete } = useUserTable()
  const [impersonatingId, setImpersonatingId] = useState<string | null>(null)
  const router = useRouter()

  const columns: ColumnDef<UserEntity>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.getValue("role") as string
        return (
          <Badge variant={role === "super_admin" ? "default" : "secondary"}>
            {formatRole(role)}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original
        const isSelf = currentUser?.id === user.id
        return (
          <div className="flex items-center gap-2">
            <PermissionGate
              action="users:update"
              user={currentUser}
              resource={{ ownerId: user.id }}
            >
              <Button variant="outline" size="sm" asChild>
                <Link href={`/d/users/${user.id}/edit`} data-testid={`edit-button-${user.id}`}>Edit</Link>
              </Button>
            </PermissionGate>
            <PermissionGate
              action="impersonate"
              user={currentUser}
            >
              {!isSelf && (
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={impersonatingId === user.id}
                  onClick={async () => {
                    setImpersonatingId(user.id)
                    const res = await impersonateUserAction(user.id)
                    if (res.success) {
                      router.push("/d")
                      router.refresh()
                    }
                    setImpersonatingId(null)
                  }}
                  data-testid={`impersonate-button-${user.id}`}
                >
                  {impersonatingId === user.id ? "..." : "Impersonate"}
                </Button>
              )}
            </PermissionGate>
            <PermissionGate
              action="users:delete"
              user={currentUser}
              resource={{ ownerId: user.id }}
            >
              <Button
                variant="destructive"
                size="sm"
                disabled={isDeleting}
                onClick={() => handleDelete(user.id)}
                data-testid={`delete-button-${user.id}`}
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
    <DataTable columns={columns} data={data} searchKey="name" />
  )
}
