import * as React from "react"
import { UserTable } from "../components/table"
import { UserEntity } from "../../../domain/types"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AuthUser } from "@/modules/auth/domain/types"
import { PermissionGate } from "@/modules/auth/presentation/ui/components/permission-gate"

export function UserListPage({
  users,
  currentUser,
}: {
  users: UserEntity[]
  currentUser: AuthUser | null | undefined
}) {
  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <PermissionGate action="users:create" user={currentUser}>
          <Button asChild>
            <Link href="/users/create">Create User</Link>
          </Button>
        </PermissionGate>
      </div>
      
      <div className="bg-white p-6 border rounded-lg shadow-sm">
        <UserTable data={users} currentUser={currentUser} />
      </div>
    </div>
  )
}
