"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import Link from "next/link"
import { formatRole } from "@/shared/lib/utils"
import { routes } from "@/shared/config/routes"
import { UserEntity } from "../../../../domain/entities/user.entity"
import { AuthUser } from "@/modules/auth/domain/types"
import { useUserTable } from "../../hooks/use-user-table"
import { PermissionGate } from "@/modules/auth/presentation/ui/components/permission-gate"
import { DataTable } from "@/shared/components/data-table/data-table"
import { impersonateUserAction } from "@/modules/auth/presentation/http/actions/impersonate.actions"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/shared/components/ui/dialog"
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
import { Input } from "@/shared/components/ui/input"
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/shared/components/ui/avatar"
import { CopyIcon, CheckIcon } from "lucide-react"

export function UserTable({
  data,
  currentUser,
  editHrefSuffix = "",
  showExtraActions = true,
}: {
  data: UserEntity[]
  currentUser: AuthUser | null | undefined
  editHrefSuffix?: string
  showExtraActions?: boolean
}) {
  const { isDeleting, pendingDeleteId, openConfirm, cancelDelete, confirmDelete, isResetting, resetResult, handleResetPassword, closeResetResult } = useUserTable()
  const [impersonatingId, setImpersonatingId] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const router = useRouter()

  const copyToClipboard = useCallback(async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }, [])

  const columns: ColumnDef<UserEntity>[] = [
    {
      id: "user",
      accessorFn: (row) => `${row.name || ""} ${row.email}`,
      header: "Name",
      cell: ({ row }) => {
        const user = row.original
        const initials = (user.name || user.email)
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
        return (
          <div className="flex items-center gap-3">
            <Avatar size="sm">
              {user.image ? (
                <AvatarImage src={user.image} alt={user.name || ""} />
              ) : null}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium text-sm">{user.name || "—"}</span>
              <span className="text-xs text-muted-foreground">{user.email}</span>
            </div>
          </div>
        )
      },
      enableSorting: true,
      sortingFn: (rowA, rowB) => {
        const nameA = rowA.original.name || rowA.original.email || ""
        const nameB = rowB.original.name || rowB.original.email || ""
        return nameA.localeCompare(nameB)
      },
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
                <Link href={`/d/users/${user.id}/edit${editHrefSuffix}`} data-testid={`edit-button-${user.id}`}>Edit</Link>
              </Button>
            </PermissionGate>
            {showExtraActions && (
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
                        router.push(routes.dashboard.root)
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
            )}
            {showExtraActions && (
              <PermissionGate
                action="users:update"
                user={currentUser}
                resource={{ ownerId: user.id }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isResetting}
                  onClick={() => handleResetPassword(user.id)}
                  data-testid={`reset-password-button-${user.id}`}
                >
                  {isResetting ? "..." : "Reset Password"}
                </Button>
              </PermissionGate>
            )}
            {showExtraActions && (
              <PermissionGate
                action="users:delete"
                user={currentUser}
                resource={{ ownerId: user.id }}
              >
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isDeleting}
                  onClick={() => openConfirm(user.id)}
                  data-testid={`delete-button-${user.id}`}
                >
                  Delete
                </Button>
              </PermissionGate>
            )}
          </div>
        )
      },
    },
  ]

  return (
    <>
      <DataTable columns={columns} data={data} searchKey="user" />
      <Dialog open={!!resetResult} onOpenChange={(open) => { if (!open) closeResetResult() }}>
        <DialogContent data-testid="reset-password-result-dialog">
          <DialogHeader>
            <DialogTitle>Password Reset Successful</DialogTitle>
            <DialogDescription>
              The user&apos;s password has been reset. Share the credentials below securely.
            </DialogDescription>
          </DialogHeader>
          {resetResult && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <div className="flex items-center gap-2">
                  <Input value={resetResult.email} readOnly className="flex-1" data-testid="reset-result-email-input" />
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => copyToClipboard(resetResult.email, "email")}
                    data-testid="copy-email-button"
                  >
                    {copiedField === "email" ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">New Password</label>
                <div className="flex items-center gap-2">
                  <Input value={resetResult.newPassword} readOnly className="flex-1 font-mono" data-testid="reset-result-password-input" />
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => copyToClipboard(resetResult.newPassword, "password")}
                    data-testid="copy-password-button"
                  >
                    {copiedField === "password" ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
                  </Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button onClick={closeResetResult} data-testid="close-reset-result-button">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!pendingDeleteId} onOpenChange={(open) => { if (!open) cancelDelete() }}>
        <AlertDialogContent data-testid="delete-confirm-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this user. This action cannot be undone.
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
